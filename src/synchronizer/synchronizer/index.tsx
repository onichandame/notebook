import { Noise } from '@chainsafe/libp2p-noise'
import { IncomingStreamData } from '@libp2p/interfaces/registrar'
import { Bootstrap } from '@libp2p/bootstrap'
import { Connection } from '@libp2p/interfaces/connection'
import { PeerId } from '@libp2p/interfaces/peer-id'
import { Mplex } from '@libp2p/mplex'
import { Multiaddr } from '@multiformats/multiaddr'
import {
  createEd25519PeerId,
  createFromProtobuf,
  exportToProtobuf,
} from '@libp2p/peer-id-factory'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { WebSockets } from '@libp2p/websockets'
import { DocumentType, ReturnCollectionType } from '@onichandame/type-rxdb'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { createLibp2p, Libp2p } from 'libp2p'
import { isRxCollection } from 'rxdb'
import { EventEmitter } from 'events'

import { Database } from '../../db'
import { Base } from '../../model/base'
import { compareDates } from '../../util'
import { Peer } from '../../model'

export class Synchronizer extends EventEmitter {
  private syncProtocol = `/sync/1.0` as const
  private handshakeProtocol = `/handshake/1.0` as const
  private updateEvent = `update` as const
  private disconnectEvent = `disconnect` as const
  private handshakeInitEvent = `handshake:init` as const
  private handshakeDenyEvent = `handshake:deny` as const
  private handshakeAcceptEvent = `handshake:accept` as const

  /** DO NOT instantiate directly using the constructor! use {@link Synchronizer.create} instead */
  constructor(private db: Database, private libp2p: Libp2p) {
    super()
  }

  static async create(db: Database) {
    // peer id
    let peerId: PeerId
    const refreshId = async () => {
      window.localStorage.removeItem(idCacheKey)
      const peerId = await createEd25519PeerId()
      if (!peerId.privateKey || !peerId.publicKey)
        throw new Error(`failed to create identity keypair`)
      window.localStorage.setItem(
        idCacheKey,
        JSON.stringify(
          exportToProtobuf(peerId).reduce(
            (prev, curr) => prev.concat(curr),
            [] as number[]
          )
        )
      )
      return peerId
    }
    const idCacheKey = `my_id`
    const idCache = window.localStorage.getItem(idCacheKey)
    if (idCache)
      try {
        peerId = await createFromProtobuf(Uint8Array.from(JSON.parse(idCache)))
      } catch {
        peerId = await refreshId()
      }
    else {
      peerId = await refreshId()
    }
    console.log(peerId.toString())

    // libp2p
    const webRtcStar = new WebRTCStar()
    const libp2p = await createLibp2p({
      connectionManager: { autoDial: false },
      peerId,
      addresses: {
        listen: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        ],
      },
      transports: [new WebSockets(), webRtcStar],
      connectionEncryption: [new Noise()],
      streamMuxers: [new Mplex()],
      peerDiscovery: [
        webRtcStar.discovery,
        new Bootstrap({
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
          ],
        }),
      ],
    })
    libp2p.connectionManager.addEventListener(`peer:connect`, e => {
      console.log(`connected to ${e.detail.remotePeer.toString()}`)
    })
    libp2p.connectionManager.addEventListener(`peer:disconnect`, e => {
      console.log(`disconnected to ${e.detail.remotePeer.toString()}`)
    })
    const synchronizer = new this(db, libp2p)
    await synchronizer.init()
    return synchronizer
  }

  public send<T extends Base>(doc: DocumentType<{ new (): T }> & T) {
    this.emit(this.updateEvent, {
      type: `sync`,
      collectionName: doc.collection.name,
      doc: doc,
    } as SyncPayload)
  }

  public async destroy() {
    await this.libp2p.stop()
    this.removeAllListeners()
  }

  public async connectToPeer(peer: Peer) {
    if (!peer.multiaddrs || !peer.multiaddrs.length) return
    let connection: Connection | null = null
    for (const multiaddr of peer.multiaddrs) {
      const abortController = new AbortController()
      setTimeout(() => {
        abortController.abort()
      }, 100000)
      connection = await this.libp2p.dial(new Multiaddr(multiaddr), {
        signal: abortController.signal,
      })
      break
    }
    if (!connection) throw new Error(`failed to connect to peer ${peer.id}`)
    const { stream: handshake } = await connection.newStream(
      this.handshakeProtocol
    )
    let handshaked = false
    for await (const hs of handshake.source) {
      if (new TextDecoder().decode(hs) === `OK`) handshaked = true
      break
    }
    handshake.close()
    if (!handshaked) {
      connection.close()
      throw new Error(`handshake to peer ${peer.id} rejected`)
    }
    const { stream: sync } = await connection.newStream(this.syncProtocol)
    const that = this
    pipe(
      async function* () {
        for await (const item of that.genSyncableItems()) yield item
      },
      source =>
        map(source, item => new TextEncoder().encode(JSON.stringify(item))),
      sync.sink
    )
    pipe(
      sync.source,
      source =>
        map(
          source,
          raw => JSON.parse(new TextDecoder().decode(raw)) as SyncPayload
        ),
      async source => {
        for await (const p of source) await this.sync(p)
      }
    )
  }

  public get id() {
    return this.libp2p.peerId.toString()
  }

  public get multiaddrs() {
    return this.libp2p.getMultiaddrs().map(v => v.toString())
  }

  on(
    ev:
      | typeof this.handshakeInitEvent
      | typeof this.handshakeAcceptEvent
      | typeof this.handshakeDenyEvent,
    cb: (payload: IncomingStreamData) => void
  ): this
  on(ev: typeof this.disconnectEvent, cb: (peerId: string) => void): this
  on(ev: typeof this.updateEvent, cb: (payload: SyncPayload) => void): this
  on(ev: string, cb: (payload: any) => void) {
    return super.on(ev, cb)
  }

  emit(
    ev:
      | typeof this.handshakeInitEvent
      | typeof this.handshakeAcceptEvent
      | typeof this.handshakeDenyEvent,
    payload: IncomingStreamData
  ): boolean
  emit(ev: typeof this.disconnectEvent, peerId: string): boolean
  emit(ev: typeof this.updateEvent, payload: SyncPayload): boolean
  emit(ev: string, payload: any) {
    return super.emit(ev, payload)
  }

  private async init() {
    await this.libp2p.handle(this.handshakeProtocol, async e => {
      const peer = await this.db.peers
        .findOne()
        .where(`id`)
        .eq(e.connection.remotePeer.toString())
        .exec()
      if (!peer) {
        this.emit(this.handshakeInitEvent, e)
      } else
        await pipe(function* () {
          yield new TextEncoder().encode(`OK`)
        }, e.stream.sink)
    })
    await this.libp2p.handle(this.syncProtocol, async e => {
      const peerId = e.connection.remotePeer.toString()
      if (await this.db.peers.findOne().where(`id`).eq(peerId).exec()) {
        pipe(
          e.stream.source,
          source =>
            map(
              source,
              raw => JSON.parse(new TextDecoder().decode(raw)) as SyncPayload
            ),
          async source => {
            for await (const payload of source) await this.sync(payload)
          }
        )
        const that = this
        pipe(
          async function* () {
            for await (const item of that.genSyncableItems()) yield item
            console.log(EventEmitter.on)
            for await (const [item] of EventEmitter.on(that, that.updateEvent))
              yield item
          },
          source =>
            map(source, item => new TextEncoder().encode(JSON.stringify(item))),
          e.stream.sink
        )
      } else {
        e.connection.close()
      }
    })
    await this.libp2p.start()
    console.log(this.libp2p.getMultiaddrs().map(v => v.toString()))
  }

  private async sync(payload: SyncPayload) {
    const collection: ReturnCollectionType<typeof Base> =
      this.db[payload.collectionName]
    if (isRxCollection(collection)) {
      const local = await collection
        .findOne()
        .where(`id`)
        .eq(payload.doc.id)
        .exec()
      if (
        !local ||
        (payload.doc.updatedAt &&
          (!local.updatedAt ||
            compareDates(payload.doc.updatedAt, local.updatedAt)))
      ) {
        await collection.atomicUpsert(payload.doc)
      }
    }
  }

  private async *genSyncableItems() {
    const collectionNames: (keyof Database)[] = [`notes`, `passwords`]
    for (const collectionName of collectionNames) {
      const collection: ReturnCollectionType<typeof Base> =
        this.db[collectionName]
      if (isRxCollection(collection)) {
        for (const doc of await collection.find().exec())
          yield { doc: doc.toJSON(), collectionName } as SyncPayload
      }
    }
  }
}

type SyncPayload = { doc: Base; collectionName: keyof Database }

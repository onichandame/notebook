import { Noise } from '@chainsafe/libp2p-noise'
import { Bootstrap } from '@libp2p/bootstrap'
import { Connection, Stream } from '@libp2p/interfaces/connection'
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

import { Database } from '../../db'
import { Base } from '../../model/base'
import { compareDates } from '../../util'
import { Peer } from '../../model'
import { Channel } from '@onichandame/channel'

export class Synchronizer extends Channel<SynchronizerEvent> {
  private syncProtocol = `/sync/1.0` as const
  private handshakeProtocol = `/handshake/1.0` as const
  private syncSwarm = new Map<string, Stream>()
  private handshakeSwarm = new Map<string, Stream>()
  private locks = new Set<string>()

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

  public update<T extends Base>(doc: DocumentType<{ new (): T }> & T) {
    this.send({
      type: `update`,
      collectionName: doc.collection.name as keyof Database,
      schemaVersion: doc.collection.schema.version,
      doc: doc,
    })
  }

  public async disconnectFromPeer(peerId: string) {
    this.syncSwarm.get(peerId)?.close()
  }

  public async destroy() {
    await this.close()
    await this.libp2p.stop()
  }

  public async connectToPeer(peer: Peer) {
    if (this.locks.has(peer.id)) return
    this.locks.add(peer.id)
    try {
      if (!peer.multiaddrs || !peer.multiaddrs.length)
        throw new Error(`peer not reachable. consider adding addresses`)
      let connection: Connection | null = null
      DialLoop: for (const multiaddr of peer.multiaddrs) {
        try {
          const abortController = new AbortController()
          connection = await this.libp2p.dial(new Multiaddr(multiaddr), {
            signal: abortController.signal,
          })
          break DialLoop
        } catch (e) {}
      }
      if (!connection) throw new Error(`failed to connect to peer ${peer.id}`)
      try {
        const { stream: handshake } = await connection.newStream(
          this.handshakeProtocol
        )
        this.handshakeSwarm.set(peer.id, handshake)
        await new Promise<void>((r, j) => {
          ;(async () => {
            for await (const hs of handshake.source) {
              if (new TextDecoder().decode(hs) === `OK`) {
                r()
                break
              }
            }
          })()
          setTimeout(() => j(new Error(`handshake timed out`)), 30000)
        }).finally(() => {
          this.handshakeSwarm.delete(peer.id)
          handshake.close()
        })
        const { stream: sync } = await connection.newStream(this.syncProtocol)
        const that = this
        this.syncSwarm.set(peer.id, sync)
        this.send({ type: `peer:connect`, peerId: peer.id })
        Promise.allSettled([
          pipe(
            async function* () {
              for await (const item of that.genSyncableItems()) yield item
              for await (const item of that)
                if (item.type === `update`) yield item
            },
            source =>
              map(source, item =>
                new TextEncoder().encode(JSON.stringify(item))
              ),
            sync.sink
          ),
          pipe(
            sync.source,
            source =>
              map(
                source,
                raw => JSON.parse(new TextDecoder().decode(raw)) as UpdateEvent
              ),
            async source => {
              for await (const p of source) await this.sync(p)
            }
          ),
        ]).finally(() => {
          this.syncSwarm.delete(peer.id)
          this.locks.delete(peer.id)
          sync.close()
          this.send({ type: `peer:disconnect`, peerId: peer.id })
        })
      } catch (e) {
        connection.close()
        throw e
      }
    } catch (e) {
      this.locks.delete(peer.id)
      throw e
    }
  }

  public async auditSwarm() {
    for (const peer of await this.db.peers.find().exec())
      if (peer.multiaddrs?.length) this.connectToPeer(peer)
    for (const [peerId, stream] of this.syncSwarm) {
      if (!(await this.db.peers.findOne().where(`id`).eq(peerId).exec()))
        stream.close()
    }
  }

  public async acceptHandshake(peerId: string) {
    await this.db.peers.insert({ name: peerId.slice(-5), id: peerId })
    const stream = this.handshakeSwarm.get(peerId)
    if (stream)
      await pipe(function* () {
        yield new TextEncoder().encode(`OK`)
      }, stream.sink)
  }

  public async denyHandshake(peerId: string) {
    this.handshakeSwarm.get(peerId)?.close()
  }

  public get id() {
    return this.libp2p.peerId.toString()
  }

  public get multiaddrs() {
    return this.libp2p.getMultiaddrs().map(v => v.toString())
  }

  private async init() {
    await this.libp2p.handle(this.handshakeProtocol, async e => {
      const peerId = e.connection.remotePeer.toString()
      if (this.locks.has(peerId)) return e.stream.close()
      try {
        this.locks.add(peerId)
        const peer = await this.db.peers.findOne().where(`id`).eq(peerId).exec()
        if (peer) {
          await pipe(function* () {
            yield new TextEncoder().encode(`OK`)
          }, e.stream.sink)
          this.locks.delete(peerId)
        } else {
          this.handshakeSwarm.set(peerId, e.stream)
          ;(async () => {
            for await (const _ of e.stream.source) {
            }
            this.handshakeSwarm.delete(peerId)
            this.locks.delete(peerId)
          })()
          this.send({ type: `peer:handshake`, peerId })
        }
      } catch (err) {
        e.stream.close()
        throw err
      }
    })
    await this.libp2p.handle(this.syncProtocol, async e => {
      const peerId = e.connection.remotePeer.toString()
      if (this.locks.has(peerId)) return e.stream.close()
      try {
        this.locks.add(peerId)
        if (await this.db.peers.findOne().where(`id`).eq(peerId).exec()) {
          this.syncSwarm.set(peerId, e.stream)
          this.send({ type: `peer:connect`, peerId })
          const that = this
          Promise.allSettled([
            pipe(
              e.stream.source,
              source =>
                map(
                  source,
                  raw =>
                    JSON.parse(new TextDecoder().decode(raw)) as UpdateEvent
                ),
              async source => {
                for await (const payload of source) await this.sync(payload)
              }
            ),
            pipe(
              async function* () {
                for await (const item of that.genSyncableItems()) yield item
                for await (const item of that)
                  switch (item.type) {
                    case `update`:
                      yield item
                      break
                  }
              },
              source =>
                map(source, item =>
                  new TextEncoder().encode(JSON.stringify(item))
                ),
              e.stream.sink
            ),
          ]).finally(() => {
            this.syncSwarm.delete(peerId)
            this.locks.delete(peerId)
            this.send({ type: `peer:disconnect`, peerId })
          })
        } else {
          e.connection.close()
          this.locks.delete(peerId)
        }
      } catch (e) {
        this.locks.delete(peerId)
        throw e
      }
    })
    await this.libp2p.start()
    console.log(this.libp2p.getMultiaddrs().map(v => v.toString()))
    const auditDaemon = setInterval(() => this.auditSwarm(), 1000 * 5)
    this.auditSwarm()
    ;(async () => {
      for await (const _ of this) {
      }
      clearInterval(auditDaemon)
    })()
  }

  private async sync(payload: UpdateEvent) {
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
          yield {
            type: `update`,
            schemaVersion: collection.schema.version,
            doc: doc.toJSON(),
            collectionName,
          } as UpdateEvent
      }
    }
  }
}

type CloseEvent = { type: 'close' }
type PeerEvent = {
  type: 'peer:disconnect' | 'peer:connect' | 'peer:handshake'
  peerId: string
}
type UpdateEvent = {
  type: 'update'
  doc: Base
  collectionName: keyof Database
  schemaVersion: number
}
type SynchronizerEvent = CloseEvent | UpdateEvent | PeerEvent

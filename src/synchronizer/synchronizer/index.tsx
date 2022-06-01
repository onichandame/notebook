import { Noise } from '@chainsafe/libp2p-noise'
import { Bootstrap } from '@libp2p/bootstrap'
import { Stream } from '@libp2p/interfaces/connection'
import { PeerId } from '@libp2p/interfaces/peer-id'
import { Mplex } from '@libp2p/mplex'
import { CID } from 'multiformats'
import {
  createFromProtobuf,
  createSecp256k1PeerId,
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
  private updateEvent = `update` as const

  /** DO NOT instantiate directly using the constructor! use {@link Synchronizer.create} instead */
  constructor(private db: Database, private libp2p: Libp2p) {
    super()
  }

  static async create(db: Database) {
    // peer id
    let peerId: PeerId
    const refreshId = async () => {
      window.localStorage.removeItem(idCacheKey)
      const peerId = await createSecp256k1PeerId()
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
      console.log(e.detail.remotePeer)
    })
    const synchronizer = new this(db, libp2p)
    await synchronizer.init()
    return synchronizer
  }

  public send<T extends Base>(doc: DocumentType<{ new (): T }> & T) {
    this.emit(this.updateEvent, {
      collectionName: doc.collection.name,
      doc: doc,
    } as SyncPayload)
  }

  public async destroy() {
    await this.libp2p.stop()
  }

  public async connectToPeer(peer: Peer) {
    const abortController = new AbortController()
    setTimeout(() => {
      abortController.abort()
    }, 2000)
    for await (const provider of this.libp2p.dht.findProviders(
      CID.parse(peer.id),
      { signal: abortController.signal }
    )) {
      if (provider.name === `PROVIDER`) {
        const prov = provider.providers[0]
        if (!prov) throw new Error(`peer not found`)
        const { stream } = await this.libp2p.dialProtocol(
          prov.id,
          this.syncProtocol
        )
        await this.sendAllToStream(stream)
        this.listenToStream(stream)
        break
      }
    }
  }

  public get id() {
    return this.libp2p.peerId.toString()
  }

  private async init() {
    await this.libp2p.handle(this.syncProtocol, async e => {
      const peerId = e.connection.remotePeer.toCID().toString()
      if (await this.db.peers.findOne().where(`id`).eq(peerId).exec()) {
        await this.sendAllToStream(e.stream)
        this.listenToStream(e.stream)
      } else e.connection.close()
    })
    await this.libp2p.start()
    console.log(this.libp2p.getMultiaddrs().map(v => v.toString()))
    const peers = await this.db.peers.find().exec()
    await Promise.all(peers.map(async peer => this.connectToPeer(peer)))
  }

  private async sendAllToStream(stream: Stream) {
    await pipe(
      this.genSyncableItems(),
      source =>
        map(source, item => new TextEncoder().encode(JSON.stringify(item))),
      stream.sink
    )
  }

  private async listenToStream(stream: Stream) {
    const handler = (payload: SyncPayload) => {
      pipe(
        [payload],
        source =>
          map(source, payload =>
            new TextEncoder().encode(JSON.stringify(payload))
          ),
        stream.sink
      )
    }
    this.on(this.updateEvent, handler)
    await pipe(
      stream.source,
      source =>
        map(
          source,
          raw => JSON.parse(new TextDecoder().decode(raw)) as SyncPayload
        ),
      async source => {
        for await (const payload of source) {
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
      }
    ).finally(() => {
      this.removeListener(this.updateEvent, handler)
    })
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

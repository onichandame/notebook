import { DocumentType } from '@onichandame/type-rxdb'
import { FC, useEffect, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'

import { Loading } from '../../../common'
import { useDb } from '../../../db'
import { Peer } from '../../../model'
import { Detail } from './detail'
import { Update } from './update'

export const Item: FC = () => {
  const params = useParams()
  const [peer, setPeer] = useState<DocumentType<typeof Peer> | null>(null)
  const db = useDb()
  useEffect(() => {
    const id = params.id
    let active = true
    if (id) {
      db?.peers
        .findOne()
        .where(`id`)
        .eq(id)
        .exec()
        .then(peer => {
          if (active) setPeer(peer)
        })
    }
    return () => {
      active = false
    }
  }, [params, db])
  return peer ? (
    <Routes>
      <Route path="/" element={<Detail peer={peer} />} />
      <Route path="update" element={<Update peer={peer} />} />
    </Routes>
  ) : (
    <Loading />
  )
}

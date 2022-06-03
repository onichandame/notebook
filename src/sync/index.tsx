import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'

import { Info } from './info'
import { Peer } from './peer'

export const Sync: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Info />} />
      <Route path="peer/*" element={<Peer />} />
    </Routes>
  )
}

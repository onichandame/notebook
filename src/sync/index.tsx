import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'

import { Create } from './create'
import { Item } from './item'
import { List } from './list'

export const Sync: FC = () => {
  return (
    <Routes>
      <Route path="create" element={<Create />} />
      <Route path="/" element={<List />} />
      <Route path=":id/*" element={<Item />} />
    </Routes>
  )
}

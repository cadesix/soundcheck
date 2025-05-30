import React from 'react'
import Table, { TableColumn } from './Table'
import styles from './Table.module.css'

interface SimilarArtist {
  id: string
  name: string
  profile_url?: string | null
}

interface SimilarArtistsTableProps {
  similarArtists: SimilarArtist[]
}

const columns: TableColumn<SimilarArtist>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Profile', accessor: 'profile_url', render: (row) => (
      row.profile_url ? (
        <a href={row.profile_url} target="_blank" rel="noopener noreferrer" className={styles['data-table-link']}>View</a>
      ) : (
        <span style={{ color: '#aaa' }}>—</span>
      )
    ) },
]

const SimilarArtistsTable: React.FC<SimilarArtistsTableProps> = ({ similarArtists }) => {
  return (
    <Table columns={columns} data={similarArtists} title="Similar Artists" />
  )
}

export default SimilarArtistsTable; 
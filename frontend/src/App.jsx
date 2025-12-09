import React, { useEffect, useState } from 'react'
import { uploadFile, listFiles, downloadUrl, deleteFile } from './api'

export default function App() {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await listFiles()
      setFiles(res) // res is an array
    } catch (err) {
      console.error(err)
      setFiles([])
    }
    setLoading(false)
  }

  async function handleUpload(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.type !== 'application/pdf') return setMsg({ type:'error', text:'Please upload a PDF only' })

    setMsg(null)
    setLoading(true)
    try {
      const res = await uploadFile(f)
      setLoading(false)
      setMsg({ type:'success', text: res.message || 'Uploaded successfully' })
      fetchList()
    } catch (err) {
      console.error(err)
      setMsg({ type:'error', text: 'Upload failed' })
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this file?')) return
    setLoading(true)
    try {
      const res = await deleteFile(id)
      setLoading(false)
      setMsg({ type:'success', text: res.message || 'Deleted' })
      fetchList()
    } catch (err) {
      console.error(err)
      setMsg({ type:'error', text: 'Delete failed' })
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Patient Document Portal</h1>

      <section className="upload">
        <label className="file-label">
          Select PDF to upload
          <input type="file" accept="application/pdf" onChange={handleUpload} />
        </label>
        {loading && <div className="info">Working...</div>}
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      </section>

      <section className="list">
        <h2>Your Documents</h2>
        {!files.length && <div>No documents uploaded yet.</div>}
        <ul>
          {files.map(f => (
            <li key={f.id}>
              <div className="meta">
                <div className="name">{f.original_name}</div>
                <div className="meta-right">
                  <small>{new Date(f.created_at).toLocaleString()}</small>
                  <button onClick={() => window.open(downloadUrl(f.stored_name), '_blank')}>Download</button>
                  <button onClick={() => handleDelete(f.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// AdminReviews.jsx
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiMessageSquare } from 'react-icons/fi'

export function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    api.get('/reviews').then(setReviews).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    await api.delete(`/reviews/${id}`)
    setReviews(rs => rs.filter(r => r._id !== id))
    toast.success('Review deleted')
  }

  const handleReply = async (id) => {
    try {
      const updated = await api.post(`/reviews/${id}/reply`, { reply: replyText })
      setReviews(rs => rs.map(r => r._id === id ? updated : r))
      setReplyId(null); setReplyText('')
      toast.success('Reply posted!')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-deep mb-6">Reviews ({reviews.length})</h1>
      {loading ? <div className="skeleton h-64 rounded-2xl" /> : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-xs">{r.user?.name?.[0]}</div>
                    <div>
                      <p className="font-semibold text-sm">{r.user?.name}</p>
                      <p className="text-xs text-gray-400">{r.user?.email} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex text-gold text-sm ml-2">{[...Array(r.rating)].map((_,i)=><span key={i}>★</span>)}</div>
                    {r.isVerifiedPurchase && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Verified</span>}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">Product: <span className="font-medium text-deep">{r.product?.name}</span></p>
                  {r.title && <p className="font-semibold text-sm mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  {r.adminReply && (
                    <div className="mt-3 pl-3 border-l-2 border-gold bg-cream rounded-r-lg p-2">
                      <p className="text-xs font-bold text-gold">Your reply:</p>
                      <p className="text-sm text-gray-600">{r.adminReply}</p>
                    </div>
                  )}
                  {replyId === r._id && (
                    <div className="mt-3 flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply…" className="input flex-1 text-sm py-2" />
                      <button onClick={() => handleReply(r._id)} className="btn-gold text-sm py-2 px-4">Post</button>
                      <button onClick={() => setReplyId(null)} className="text-sm text-gray-400 px-3">Cancel</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setReplyId(r._id); setReplyText(r.adminReply || '') }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiMessageSquare size={15} /></button>
                  <button onClick={() => handleDelete(r._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">⭐</div><p>No reviews yet</p></div>}
        </div>
      )}
    </div>
  )
}

export default AdminReviews

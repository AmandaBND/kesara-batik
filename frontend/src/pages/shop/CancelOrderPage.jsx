import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'

export default function CancelOrderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    reason: '',
    accountNumber: '',
    bankName: '',
    accountHolderName: '',
    branch: '',
    notes: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`orders/${id}`)
        setOrder(data)
      } catch (err) {
        setError(err.message || 'Unable to load order')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const canCancel = () => {
    if (!order?.createdAt) return false
    const createdAt = new Date(order.createdAt)
    const cutoff = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
    return new Date() <= cutoff
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post(`orders/${id}/cancel`, form)
      navigate('/orders')
    } catch (err) {
      setError(err.message || 'Unable to submit cancellation request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet><title>Cancel Order | Kesara Bathik</title></Helmet>
      <div className="section max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Cancel Order</h1>
        <p className="text-gray-500 mb-6">Submit your cancellation request for this order.</p>

        {loading ? (
          <div className="card p-6 skeleton h-40" />
        ) : error ? (
          <div className="card p-6 text-red-600">{error}</div>
        ) : !canCancel() ? (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold mb-3">Sorry</h2>
            <p className="text-gray-600">Sorry, an order can cancel only within 1 day from order date.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                <input value={form.accountHolderName} onChange={e => setForm({ ...form, accountHolderName: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <input value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Branch</label>
                <input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input min-h-[100px]" />
            </div>
            <button type="submit" disabled={submitting} className="btn-gold">{submitting ? 'Submitting...' : 'Submit Cancellation Request'}</button>
          </form>
        )}
      </div>
    </>
  )
}

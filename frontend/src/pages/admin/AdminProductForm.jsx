import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUpload, FiX, FiPlus, FiSave } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  "Women's Saree","Women's Lungi","Batik Kandyan designs","Batik Frocks",
  "Batik Tops & Skirts","Batik Tops & Pants","Batik Kurtha Sets","Batik Kaftan",
  "Men's Avurudu Kits","Men's Sarong","Batik Shirts","Kid's Focks","Kid's Lama Saree",
  "Kids Shirts and Sarong","Family Kits","Bags","Jewellery","Clutches","Slippers",
  "Hair Accessories","Lungi","Sarong/Lungi","Unisex"
]
const PARENT_CATS = ['Women','Men','Kids','Family Kits','Accessories','Unisex']
const SIZES = ['XS','S','M','L','XL','XXL','XXXL','Free Size','2Y','4Y','6Y','8Y','10Y','12Y']

const FORM_FIELDS = [
  'name', 'nameLocal', 'sku', 'description', 'shortDescription',
  'price', 'priceLKR', 'comparePrice', 'category', 'parentCategory',
  'fabric', 'length', 'width', 'care',
  'isFeatured', 'isNewArrival', 'isTrending', 'isActive',
  'stockCount', 'weight',
  'metaTitle', 'metaDescription',
]

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [activeTab, setActiveTab] = useState('basic')

  const [form, setForm] = useState({
    name: '', nameLocal: '', sku: '', description: '', shortDescription: '',
    price: '', priceLKR: '', comparePrice: '', category: '', parentCategory: '',
    fabric: '', length: '', width: '', care: '',
    isFeatured: false, isNewArrival: true, isTrending: false, isActive: true,
    stockCount: 0, weight: '',
    metaTitle: '', metaDescription: '', metaKeywords: '',
    tags: '',
    variants: [{ size: '', color: '', colorCode: '', stock: 0, sku: '' }],
    additionalInfo: {},
  })
  const [addInfoKey, setAddInfoKey] = useState('')
  const [addInfoVal, setAddInfoVal] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/admin/${id}`).then(p => {
      setForm({
        name: p.name || '',
        nameLocal: p.nameLocal || '',
        sku: p.sku || '',
        description: p.description || '',
        shortDescription: p.shortDescription || '',
        price: p.price ?? '',
        priceLKR: p.priceLKR ?? '',
        comparePrice: p.comparePrice ?? '',
        category: p.category || '',
        parentCategory: p.parentCategory || '',
        fabric: p.fabric || '',
        length: p.length || '',
        width: p.width || '',
        care: p.care || '',
        isFeatured: !!p.isFeatured,
        isNewArrival: p.isNewArrival !== false,
        isTrending: !!p.isTrending,
        isActive: p.isActive !== false,
        stockCount: p.stockCount ?? 0,
        weight: p.weight ?? '',
        metaTitle: p.metaTitle || '',
        metaDescription: p.metaDescription || '',
        metaKeywords: (p.metaKeywords || []).join(', '),
        tags: (p.tags || []).join(', '),
        variants: p.variants?.length ? p.variants : [{ size:'', color:'', colorCode:'', stock:0, sku:'' }],
        additionalInfo: typeof p.additionalInfo === 'object' && p.additionalInfo ? p.additionalInfo : {},
      })
      setExistingImages(p.images || [])
    }).catch(() => toast.error('Failed to load product')).finally(() => setFetching(false))
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(prev => [...prev, ...files])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(f)
    })
  }

  const removeNewImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i))
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const removeExistingImage = async (imgId) => {
    if (!confirm('Remove this image?')) return
    try {
      const updated = await api.delete(`/products/${id}/images/${imgId}`)
      setExistingImages(updated.images || [])
      toast.success('Image removed')
    } catch { toast.error('Failed to remove image') }
  }

  const addVariant = () => setForm(f => ({ ...f, variants: [...f.variants, { size:'', color:'', colorCode:'', stock:0, sku:'' }] }))
  const removeVariant = (i) => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))
  const setVariant = (i, key, val) => setForm(f => {
    const v = [...f.variants]; v[i] = { ...v[i], [key]: val }; return { ...f, variants: v }
  })

  const addAdditionalInfo = () => {
    if (!addInfoKey.trim()) return
    setForm(f => ({ ...f, additionalInfo: { ...f.additionalInfo, [addInfoKey]: addInfoVal } }))
    setAddInfoKey(''); setAddInfoVal('')
  }
  const removeAdditionalInfo = (key) => {
    setForm(f => { const ai = { ...f.additionalInfo }; delete ai[key]; return { ...f, additionalInfo: ai } })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('[Product Form] Starting submission...')
      const fd = new FormData()
      FORM_FIELDS.forEach(k => {
        const v = form[k]
        if (v !== undefined && v !== null) fd.append(k, v)
      })
      fd.append('tags', form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean).join(',') : '')
      fd.append('metaKeywords', form.metaKeywords ? form.metaKeywords.split(',').map(t => t.trim()).filter(Boolean).join(',') : '')
      fd.append('variants', JSON.stringify(form.variants))
      fd.append('additionalInfo', JSON.stringify(form.additionalInfo))
      imageFiles.forEach(f => fd.append('images', f))
      
      console.log('[Product Form] Submitting with', imageFiles.length, 'images')

      if (isEdit) {
        await api.put(`/products/${id}`, fd)
        toast.success('Product updated!')
      } else {
        await api.post('/products', fd)
        toast.success('Product created!')
      }
      navigate('/admin/products')
    } catch (err) {
      console.error('[Product Form Error]', err)
      const errorMsg = err?.message || err?.data?.message || 'Save failed'
      toast.error(errorMsg)
    }
    finally { setLoading(false) }
  }

  if (fetching) return <div className="skeleton h-96 rounded-2xl" />

  const TABS = [
    { id: 'basic', label: '📝 Basic Info' },
    { id: 'media', label: '🖼️ Images' },
    { id: 'variants', label: '📐 Variants & Stock' },
    { id: 'details', label: '📋 Details' },
    { id: 'seo', label: '🔍 SEO' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-deep">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline-gold text-sm py-2 px-4">Cancel</button>
          <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 text-sm py-2 px-5">
            <FiSave size={15} />{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-white shadow text-deep' : 'text-gray-500 hover:text-deep'}`}>{t.label}</button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Product Name (English) *</label><input required value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="e.g. White Silk Batik Saree with Roses" /></div>
            <div className="col-span-2"><label className="label">Product Name (Sinhala)</label><input value={form.nameLocal} onChange={e => set('nameLocal', e.target.value)} className="input" placeholder="e.g. සාරි" /></div>
            <div><label className="label">SKU</label><input value={form.sku} onChange={e => set('sku', e.target.value)} className="input" placeholder="e.g. KB-SAR-001" /></div>
            <div><label className="label">Category *</label>
              <select required value={form.category} onChange={e => set('category', e.target.value)} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Parent Category *</label>
              <select required value={form.parentCategory} onChange={e => set('parentCategory', e.target.value)} className="input">
                <option value="">Select parent</option>
                {PARENT_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Price (CAD) *</label><input type="number" required min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="input" placeholder="89.00" /></div>
            <div><label className="label">Price (LKR - Manual)</label><input type="number" min="0" step="0.01" value={form.priceLKR} onChange={e => set('priceLKR', e.target.value)} className="input" placeholder="25000.00" /></div>
            <div><label className="label">Compare Price (CAD)</label><input type="number" min="0" step="0.01" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} className="input" placeholder="Original price (optional)" /></div>
            <div><label className="label">Stock Count</label><input type="number" min="0" value={form.stockCount} onChange={e => set('stockCount', e.target.value)} className="input" /></div>
          </div>

          <div><label className="label">Short Description</label><input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="input" placeholder="One-line description" /></div>
          <div><label className="label">Full Description *</label><textarea required rows={5} value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none" placeholder="Detailed product description…" /></div>
          <div><label className="label">Tags (comma separated)</label><input value={form.tags} onChange={e => set('tags', e.target.value)} className="input" placeholder="saree, silk, women, batik" /></div>

          <div className="flex flex-wrap gap-6">
            {[['isFeatured','⭐ Featured'],['isNewArrival','✨ New Arrival'],['isTrending','🔥 Trending'],['isActive','✅ Active']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="w-4 h-4 accent-gold" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Images */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold mb-4">Product Images</h3>
          <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-gold transition-colors">
            <FiUpload size={28} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Max 5MB each · Up to 10 images</p>
            <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
          </label>

          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
              {existingImages.map(img => (
                <div key={img._id} className="relative group">
                  <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg border" />
                  {isEdit && <button type="button" onClick={() => removeExistingImage(img._id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={10} /></button>}
                </div>
              ))}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-lg border-2 border-gold" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><FiX size={10} /></button>
                  <span className="absolute bottom-1 left-1 bg-gold text-deep text-xs px-1 rounded font-bold">NEW</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Variants */}
      {activeTab === 'variants' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Size & Color Variants</h3>
            <button type="button" onClick={addVariant} className="flex items-center gap-2 text-sm text-gold hover:text-gold-dark font-medium transition-colors"><FiPlus size={15} /> Add Variant</button>
          </div>
          <div className="space-y-3">
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-3 items-center bg-gray-50 rounded-xl p-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Size</label>
                  <select value={v.size} onChange={e => setVariant(i, 'size', e.target.value)} className="input text-xs py-1.5">
                    <option value="">Any</option>
                    {SIZES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Color</label>
                  <input value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} className="input text-xs py-1.5" placeholder="Blue" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Color Code</label>
                  <div className="flex gap-1">
                    <input type="color" value={v.colorCode || '#C8923A'} onChange={e => setVariant(i, 'colorCode', e.target.value)} className="w-10 h-8 rounded border cursor-pointer p-0.5" />
                    <input value={v.colorCode} onChange={e => setVariant(i, 'colorCode', e.target.value)} className="input text-xs py-1.5 flex-1" placeholder="#C8923A" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Stock</label>
                  <input type="number" min="0" value={v.stock} onChange={e => setVariant(i, 'stock', parseInt(e.target.value) || 0)} className="input text-xs py-1.5" />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiX size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Details */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Fabric / Material</label><input value={form.fabric} onChange={e => set('fabric', e.target.value)} className="input" placeholder="e.g. Silk, Cotton" /></div>
            <div><label className="label">Length</label><input value={form.length} onChange={e => set('length', e.target.value)} className="input" placeholder="e.g. 7 yards" /></div>
            <div><label className="label">Width</label><input value={form.width} onChange={e => set('width', e.target.value)} className="input" placeholder="e.g. 45 inches" /></div>
            <div><label className="label">Care Instructions</label><input value={form.care} onChange={e => set('care', e.target.value)} className="input" placeholder="e.g. Hand wash cold" /></div>
            <div><label className="label">Weight (grams)</label><input type="number" min="0" value={form.weight} onChange={e => set('weight', e.target.value)} className="input" placeholder="e.g. 400" /></div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Additional Information</h3>
            <div className="flex gap-2 mb-3">
              <input value={addInfoKey} onChange={e => setAddInfoKey(e.target.value)} className="input flex-1" placeholder="Key (e.g. Origin)" />
              <input value={addInfoVal} onChange={e => setAddInfoVal(e.target.value)} className="input flex-1" placeholder="Value (e.g. Colombo, Sri Lanka)" />
              <button type="button" onClick={addAdditionalInfo} className="btn-gold text-sm py-2 px-4 shrink-0"><FiPlus size={15} /></button>
            </div>
            {Object.entries(form.additionalInfo || {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2 text-sm">
                <span className="font-medium">{k}:</span><span className="text-gray-600">{v}</span>
                <button type="button" onClick={() => removeAdditionalInfo(k)} className="text-red-400 hover:text-red-600 ml-2"><FiX size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-sm text-gray-500">SEO settings help your products rank on Google in Canada, USA, UAE, Japan and more.</p>
          <div><label className="label">Meta Title</label><input value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} className="input" placeholder="Custom page title (default: product name)" /><p className="text-xs text-gray-400 mt-1">Recommended: 50-60 characters</p></div>
          <div><label className="label">Meta Description</label><textarea rows={3} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} className="input resize-none" placeholder="Brief description for search results…" /><p className="text-xs text-gray-400 mt-1">Recommended: 120-160 characters</p></div>
          <div><label className="label">Meta Keywords (comma separated)</label><input value={form.metaKeywords} onChange={e => set('metaKeywords', e.target.value)} className="input" placeholder="batik saree canada, sri lankan batik, silk saree" /></div>
        </div>
      )}

      <style>{`.label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: #374151; }`}</style>
    </form>
  )
}

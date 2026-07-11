import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiFeather,
  FiGlobe,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiRefreshCw,
  FiSend,
  FiShield,
} from 'react-icons/fi'

import ProductCard from '../../components/shop/ProductCard'
import Seo from '../../components/common/Seo'
import api from '../../utils/api'

import heroPeacockSaree from '../../assets/home/hero-peacock-saree1.png'
import homePageText from '../../assets/home/home_page_text.png'

import womenCategoryImage from '../../assets/categories/women.jpeg'
import menCategoryImage from '../../assets/categories/men.jpeg'
import kidsCategoryImage from '../../assets/categories/kids.jpeg'
import familyCategoryImage from '../../assets/categories/family.jpeg'
import accessoriesCategoryImage from '../../assets/categories/accessories.png'

const CATEGORIES = [
  {
    name: 'Women',
    image: womenCategoryImage,
    desc: 'Sarees, Kurthas & more',
    href: '/products?parentCategory=Women',
  },
  {
    name: 'Men',
    image: menCategoryImage,
    desc: 'Shirts, Sarongs & kits',
    href: '/products?parentCategory=Men',
  },
  {
    name: 'Kids',
    image: kidsCategoryImage,
    desc: 'Batik styles for children',
    href: '/products?parentCategory=Kids',
  },
  {
    name: 'Family Kits',
    image: familyCategoryImage,
    desc: 'Matching sets for the family',
    href: '/products?parentCategory=Family+Kits',
  },
  {
    name: 'Accessories',
    image: accessoriesCategoryImage,
    desc: 'Bags, jewellery & more',
    href: '/products?parentCategory=Accessories',
  },
]

const HERO_HIGHLIGHTS = [
  {
    title: 'Ships to Overseas',
    description: 'Door-to-door delivery from Colombo',
    Icon: FiGlobe,
  },
  {
    title: '100% Handcrafted',
    description: 'Traditional wax-resist dyeing',
    Icon: FiFeather,
  },
  {
    title: 'Secure Payment',
    description: 'Dialog Genie & HNB Bank Transfer',
    Icon: FiShield,
  },
  {
    title: 'Easy Returns',
    description: '14-day return guarantee',
    Icon: FiRefreshCw,
  },
]

const TRUST_BADGES = [
  {
    title: 'International Shipping',
    description: '7–14 days tracked delivery',
    Icon: FiSend,
  },
  {
    title: 'Carefully Packaged',
    description: 'Arrives in pristine condition',
    Icon: FiPackage,
  },
  {
    title: 'Buyer Protection',
    description: 'Full 14-day return policy',
    Icon: FiShield,
  },
  {
    title: 'WhatsApp Support',
    description: 'Chat for sizing & tracking',
    Icon: FiMessageCircle,
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Fernando',
    loc: 'Toronto, Canada',
    text: 'Ordered two sarees and they arrived in 10 days beautifully packed. The quality is outstanding — my mother was in tears!',
    rating: 5,
  },
  {
    name: 'Rajiv Silva',
    loc: 'Vancouver, Canada',
    text: 'The batik shirts are exactly what I was looking for — authentic Sri Lankan craftsmanship at a fair price. Fast shipping!',
    rating: 5,
  },
  {
    name: 'Nishani Kumari',
    loc: 'Melbourne, Australia',
    text: 'Bought a family kit for Avurudu celebrations — we all matched beautifully! Will definitely order again.',
    rating: 5,
  },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('products?featured=true&limit=8'),
      api.get('products?newArrival=true&limit=8'),
    ])
      .then(([featuredResponse, newArrivalsResponse]) => {
        setFeatured(featuredResponse.products || [])
        setNewArrivals(newArrivalsResponse.products || [])
      })
      .catch((error) => {
        console.error('Failed to load homepage products:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Seo
        title="Kesara Bathik | Authentic Sri Lankan Handcrafted Batik Fashion"
        description="Shop authentic handcrafted Sri Lankan Batik sarees, sarongs, shirts and family kits. Free shipping to Canada & USA on orders over CA$120."
        path="/"
      />

      {/* HERO SECTION */}
      <section
        className="relative isolate flex min-h-[500px] items-center overflow-hidden xl:min-h-[540px]"
        style={{
          background:
            'linear-gradient(115deg, #21140C 0%, #2B1A0F 48%, #3D2B0E 100%)',
        }}
      >
        {/* Decorative background pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8923A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Peacock saree image */}
        <div className="pointer-events-none absolute inset-y-0 right-[-2%] z-[1] hidden w-[74%] select-none overflow-hidden lg:block xl:w-[72%]">
          {/* Image layer with transparent left-edge mask */}
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 6%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.75) 28%, #000 43%, #000 100%)',
              maskImage:
                'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 6%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.75) 28%, #000 43%, #000 100%)',
            }}
          >
            <img
              src={heroPeacockSaree}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-[1.16] object-cover opacity-[0.9]"
              style={{
                objectPosition: '48% 43%',
              }}
            />

            {/* Subtle brown colour grading */}
            <div className="absolute inset-0 bg-[#2B1A0F]/10 mix-blend-multiply" />

            {/* Gentle overall darkness */}
            <div className="absolute inset-0 bg-black/[0.03]" />
          </div>
        </div>

        {/* Wide brown transition over the image */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] hidden w-[64%] lg:block"
          style={{
            background:
              'linear-gradient(90deg, #21140C 0%, #24160D 42%, rgba(43,26,15,0.98) 58%, rgba(43,26,15,0.82) 69%, rgba(43,26,15,0.48) 81%, rgba(43,26,15,0.16) 92%, transparent 100%)',
          }}
        />

        {/* Soft radial transition around image starting area */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[28%] z-[3] hidden w-[36%] lg:block"
          style={{
            background:
              'radial-gradient(ellipse at left center, rgba(43,26,15,0.72) 0%, rgba(43,26,15,0.45) 35%, rgba(43,26,15,0.16) 67%, transparent 100%)',
          }}
        />

        {/* Mobile background decoration */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-transparent to-gold/5 lg:hidden" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 lg:px-8 lg:py-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] xl:gap-10">
            {/* Left hero content */}
            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
              }}
              className="relative z-20"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">
                Authentic Sri Lankan Craftsmanship
              </p>

              {/* Hero title */}
              <h1 className="mb-4">
                {/* Accessible heading text for SEO and screen readers */}
                <span className="sr-only">
                  කේසර බතික් Fashion
                </span>

                {/* Sinhala title image */}
                <span
                  aria-hidden="true"
                  className="relative block aspect-[1009/734] w-[205px] overflow-hidden sm:w-[220px] lg:w-[235px] xl:w-[245px]"
                >
                  <img
                    src={homePageText}
                    alt=""
                    className="absolute left-[-12.1%] top-[-30.7%] block w-[124.2%] max-w-none select-none"
                    draggable="false"
                  />
                </span>

                {/* English title */}
                <span
                  aria-hidden="true"
                  className="mt-1 block font-display text-3xl font-bold leading-tight text-white lg:text-4xl"
                >
                  Fashion
                </span>
              </h1>

              <p className="mb-6 max-w-lg text-lg leading-relaxed text-gray-400">
                Handcrafted in the heart of Sri Lanka. Every piece carries
                centuries of artisan tradition — shipped to Canada, USA, UAE
                and worldwide.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="btn-gold text-base"
                >
                  Shop Collection
                </Link>

                <Link
                  to="/products?newArrival=true"
                  className="btn-outline-gold text-base"
                >
                  New Arrivals
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-7 border-t border-white/10 pt-5 sm:gap-8">
                {[
                  ['500+', 'Products'],
                  ['1200+', 'Happy Customers'],
                  ['15+', 'Countries'],
                ].map(([number, label]) => (
                  <div key={label}>
                    <div className="font-display text-2xl font-bold text-gold">
                      {number}
                    </div>

                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Highlight cards */}
            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.2,
              }}
              className="relative z-20 hidden min-h-[410px] items-center lg:flex"
            >
              <div className="ml-auto grid w-full max-w-[500px] grid-cols-2 gap-3 xl:max-w-[520px] xl:gap-4">
                {HERO_HIGHLIGHTS.map(
                  ({
                    title,
                    description,
                    Icon,
                  }) => (
                    <div
                      key={title}
                      className="rounded-[1.5rem] border border-gold/20 bg-[#21150F]/55 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-[10px] xl:p-5"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/15 text-gold xl:h-11 xl:w-11">
                        <Icon className="text-xl" />
                      </div>

                      <h3 className="mb-1.5 font-display text-sm font-semibold text-gold">
                        {title}
                      </h3>

                      <p className="text-[11px] leading-relaxed text-gray-300/80 xl:text-xs">
                        {description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold text-deep">
            Shop by{' '}
            <span className="text-gold">
              Category
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                delay: index * 0.08,
              }}
            >
              <Link
                to={category.href}
                className="group block rounded-[1.75rem] border border-gold/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/5]">
                  <img
                    src={category.image}
                    alt={`${category.name} batik collection`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5">
                    <h3 className="font-display text-xl font-bold leading-tight">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-white/85">
                      {category.desc}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-gold-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-8 lg:py-10">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-3xl font-bold text-deep">
              New{' '}
              <span className="text-gold">
                Arrivals
              </span>
            </h2>

            <Link
              to="/products?newArrival=true"
              className="border-b border-gold pb-0.5 text-sm font-semibold text-gold transition-opacity hover:opacity-70"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {newArrivals.length > 0 ? (
                newArrivals.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))
              ) : (
                <EmptyProductMessage message="No new arrivals are available at the moment." />
              )}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold text-deep">
            Featured{' '}
            <span className="text-gold">
              Products
            </span>
          </h2>

          <Link
            to="/products?featured=true"
            className="border-b border-gold pb-0.5 text-sm font-semibold text-gold transition-opacity hover:opacity-70"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featured.length > 0 ? (
              featured.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))
            ) : (
              <EmptyProductMessage message="No featured products are available at the moment." />
            )}
          </div>
        )}
      </section>

      {/* TRUST BADGES */}
      <section className="bg-deep py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-8">
          {TRUST_BADGES.map(
            ({
              title,
              description,
              Icon,
            }) => (
              <div
                key={title}
                className="flex items-center gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                  <Icon className="text-[1.35rem]" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gold">
                    {title}
                  </h4>

                  <p className="mt-1 text-xs text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 lg:px-8">
        <h2 className="mb-7 text-center font-display text-3xl font-bold text-deep">
          Customer{' '}
          <span className="text-gold">
            Love
          </span>
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="card p-6"
            >
              <div
                className="mb-3 flex text-gold"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {[...Array(testimonial.rating)].map((_, index) => (
                  <span key={index}>
                    ★
                  </span>
                ))}
              </div>

              <p className="mb-4 text-sm italic leading-relaxed text-gray-600">
                “{testimonial.text}”
              </p>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-light text-sm font-bold text-gold">
                  {testimonial.name[0]}
                </div>

                <div>
                  <div className="text-sm font-semibold text-deep">
                    {testimonial.name}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FiMapPin className="text-gold" />

                    <span>
                      {testimonial.loc}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="card overflow-hidden"
        >
          <div className="skeleton aspect-[3/4]" />

          <div className="space-y-2 p-4">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyProductMessage({ message }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-gold/30 bg-gold-50 px-6 py-10 text-center">
      <p className="text-sm text-gray-500">
        {message}
      </p>

      <Link
        to="/products"
        className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
      >
        Browse all products
      </Link>
    </div>
  )
}
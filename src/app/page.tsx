'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import Highlights from '@/components/sections/Highlights'
import About from '@/components/sections/About'
import Amenities from '@/components/sections/Amenities'
import BookingWidget from '@/components/sections/BookingWidget'
import Reviews from '@/components/sections/Reviews'
import Location from '@/components/sections/Location'
import HouseRules from '@/components/sections/HouseRules'
import Contact from '@/components/sections/Contact'

export default function Home() {
  const [checkin, setCheckin] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<string | null>(null)
  const [guests, setGuests] = useState(2)

  return (
    <>
      <Navbar />
      <Hero checkin={checkin} checkout={checkout} guests={guests} />
      <Highlights />
      <About />
      <Amenities />
      <BookingWidget
        checkin={checkin}
        checkout={checkout}
        guests={guests}
        onCheckinChange={setCheckin}
        onCheckoutChange={setCheckout}
        onGuestsChange={setGuests}
      />
      <Reviews />
      <Location />
      <HouseRules />
      <Contact />
      <Footer />
    </>
  )
}
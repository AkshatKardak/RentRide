import React from 'react'
import banner from '@/assets/banner.jpg';
import { motion } from 'framer-motion'
import { FadeLeft } from '@/utils/Animation'
import { Send } from 'lucide-react'

const Banner = () => {
return (
<div id="contact" className='relative overflow-hidden bg-background-light dark:bg-background-dark'>
<div className='absolute inset-0'>
<img
src={banner}
alt="Banner"
className='w-full h-full object-cover opacity-20 dark:opacity-30'
/>
<div className='absolute inset-0 bg-linear-to-r from-primary/120 via-primary/ to-primary/40'></div>
</div>

<div className='relative min-h-175 lg:min-h-200 flex items-center justify-end px-4 lg:px-16 max-w-7xl mx-auto py-20'>
<motion.div
variants={FadeLeft(0.2)}
initial="hidden"
whileInView="visible"
viewport={{ once: true }}
className='w-full max-w-md'
>
<h2 className='text-4xl lg:text-5xl font-bold mb-2 text-white'>
Get In Touch
</h2>
<p className='text-gray-200 mb-6'>Connect with our team to book your ride</p>

<form className='bg-white dark:bg-background-dark-secondary backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-8 space-y-4 shadow-2xl'>
<div className='grid grid-cols-2 gap-4'>
<div className='flex flex-col gap-2'>
<label className='font-semibold text-primary text-sm'>First Name</label>
<input
className='p-3 rounded-lg bg-background-secondary dark:bg-background-dark border-2 border-border-light dark:border-border-dark text-text-primary dark:text-text-dark-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all'
type="text"
name="firstName"
placeholder='First name'
required
/>
</div>
<div className='flex flex-col gap-2'>
<label className='font-semibold text-primary text-sm'>Last Name</label>
<input
className='p-3 rounded-lg bg-background-secondary dark:bg-background-dark border-2 border-border-light dark:border-border-dark text-text-primary dark:text-text-dark-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all'
type="text"
name="lastName"
placeholder='Last name'
required
/>
</div>
</div>

<div className='flex flex-col gap-2'>
<label className='font-semibold text-primary text-sm'>Email</label>
<input
className='p-3 rounded-lg bg-background-secondary dark:bg-background-dark border-2 border-border-light dark:border-border-dark text-text-primary dark:text-text-dark-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all'
type="email"
name="email"
placeholder='john@example.com'
required
/>
</div>

<div className='flex flex-col gap-2'>
<label className='font-semibold text-primary text-sm'>Phone Number</label>
<input
className='p-3 rounded-lg bg-background-secondary dark:bg-background-dark border-2 border-border-light dark:border-border-dark text-text-primary dark:text-text-dark-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all'
type="tel"
name="phone"
placeholder='+91 98765 43210'
required
/>
</div>

<div className='flex flex-col gap-2'>
<label className='font-semibold text-primary text-sm'>Message</label>
<textarea
className='p-3 rounded-lg bg-background-secondary dark:bg-background-dark border-2 border-border-light dark:border-border-dark text-text-primary dark:text-text-dark-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-all min-h-[100px] resize-none'
name="message"
placeholder='Tell us about your requirements...'
required
/>
</div>

<motion.button
type="submit"
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
className='w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl'
>
<Send size={20} />
Send Message
</motion.button>
</form>
</motion.div>
</div>
</div>
)
}

export default Banner

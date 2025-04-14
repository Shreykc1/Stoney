import React from 'react'
import { Button } from "@/components/ui/button"
import HJDrawer from '@/components/HJDrawer'



const HostJoin = () => {
  return (
    <div className='min-h-screen w-full bg-yellow-300 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='text-center'>
        <h1 className='text-4xl sm:text-6xl md:text-[6rem] font-spc animate-in slide-in-from-top duration-500'>
          Stoney
        </h1>
        <p className='mt-4 text-lg sm:text-xl text-gray-700 animate-in fade-in duration-700 delay-200'>
          Play the classic game with a twist
        </p>
      </div>

      <div className='flex flex-col gap-4 mt-12 sm:mt-20 w-full max-w-xs animate-in slide-in-from-bottom duration-500 delay-300'>
        <HJDrawer type={'Host'}>
          <Button className='w-full rounded-lg bg-gray-800 text-yellow-300 text-xl sm:text-2xl py-6 hover:bg-gray-700 transition-colors'>
            Host
          </Button>
        </HJDrawer>
        <HJDrawer type={'Join'}>
          <Button className='w-full rounded-lg bg-gray-800 text-yellow-300 text-xl sm:text-2xl py-6 hover:bg-gray-700 transition-colors'>
            Join
          </Button>
        </HJDrawer>
      </div>
    </div>
  )
}

export default HostJoin

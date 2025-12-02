import React from 'react'

const Loading = () => {
  return (
    <div className='flex gap-4 w-full flex-col items-center justify-center mt-40'>
      <div className='w-20 h-20 border-4 border-transparent text-red-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full'>
      </div>
    </div>
  )
}

export default Loading

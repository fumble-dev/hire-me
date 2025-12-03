import { Card } from '@/components/ui/card'
import { AccountProps } from '@/type'
import { Briefcase, FileText, Mail, Phone } from 'lucide-react'
import React from 'react'

const Info:React.FC<AccountProps> = ({user,isYourAccount}) => {
  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <Card className='overflow-hidden shadow-lg border-2'>
        <div className='h-32 bg-blue-500 relative'>
            <div className="absolute -bottom-16 left-8">
                <div className="relative group w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl bg-background">
                    <img 
                        src={user.profile_pic ? user.profile_pic : "/user.jpeg"} 
                        alt="user-img" 
                        className='w-full h-full object-cover' 
                    />
                </div>
                {/* edit option */}
            </div>
        </div>

        {/* main content */}
        <div className='pt-20 pb-8 px-8'>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className='text-3xl font-bold'>

                </h1>
                {/* edit button */}
              </div>

              <div className='flex items-center gap-2 text-sm opacity-70'>
                <Briefcase size={16}/>
                <span className='capitalize'>{user.role}</span>
              </div>
            </div>
          </div>

          {/* bio  */}
          {
            user.role === "jobseeker" && user.bio &&
            (<div className='mt-6 p-4 rounded-lg border'>
              <div className='flex itec gap02 mb-2 text-sm font-medium opacity-70'>
                <FileText size={16}/>
                <span>About</span>
              </div>
              <p className='text-base leading-relaxed'>{user.bio}</p>
            </div>)
          }

          {/* contact info */}
          <div className='mt-8'>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Mail size={20} className='text-blue-600'/>
              Contact Information 
            </h2>
            <div className="grid md:grid-cols-2 gap-4">

              <div className='flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors'>
                <div className='h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                  <Mail size={18} className='text-blue-600'/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-70 font-medium">Email</p>
                  <p className="text-sm truncate">{user.email}</p>
                </div>
              </div>

              <div className='flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 transition-colors'>
                <div className='h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                  <Phone size={18} className='text-blue-600'/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-70 font-medium">Phone Number</p>
                  <p className="text-sm truncate">{user.phone_number}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Info

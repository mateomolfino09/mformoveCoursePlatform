import React from 'react'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout'  
const index = () => {
  return (
    <AdmimDashboardLayout>
      <div className='bg-gray-700 w-full'>
        <p className="text-white text-3xl my-12 font-bold">Dashboard</p>

        <div className="grid lg:grid-cols-3 gap-5 mb-16">
          <div className="rounded bg-gray-500 h-40 shadow-sm"></div>
          <div className="rounded bg-gray-500 h-40 shadow-sm"></div>
          <div className="rounded bg-gray-500 h-40 shadow-sm"></div>
        </div>
        <div className="grid col-1 bg-gray-500 h-96 shadow-sm"></div>
      </div>
    </AdmimDashboardLayout>
  )
}

export default index
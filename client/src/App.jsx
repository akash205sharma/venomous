import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {


	let x = 2;
	let y = 3;

	return (
		<>
			<div className='z-[-20] bg-[url(bg.avif)] bg-cover bg-center h-screen'>


				{/* snake and ladder */}

				<div className='absolute left-[45vh] h-[90vh] w-[50vw] mb-[-6px] ' >
					<img style={{ left: `${1.5 + 4.5 * x}rem`, top: `${2.5 + 4 * y}rem` }} className='relative z-20 h-[70px] w-[70px]' src="avatar1.png" alt="" />
					<img className='absolute z-0 h-[90vh] w-[50vw] top-10' src="s&l2.avif" alt="" />
				</div>


				{/* avatars */}


				<div className='flex flex-col ml-9  gap-10 h-screen'>

					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar1.png" alt="" /></div> Srishti </div>
						<div className='  h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src="six.png" alt="" /></div>
					</div>



					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar2.png" alt="" /></div> Rishav </div>
						<div className='h-[60px] w-[60px] rounded-lg bg-white border-green-600 border-4 ' ><img src="two.png" alt="" /></div>
					</div>


					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar3.png" alt="" /></div> Raghav </div>
						<div className='h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src="five.png" alt="" /></div>
					</div>


					<div className='flex relative gap-2 items-center ' >
						<div className='text-center text-white font-extrabold text-xl' ><div className='border-4 bg-blue-500 rounded-full p-2' ><img width={100} src="avatar4.png" alt="" /></div> Sharadha </div>
						<div className='h-[60px] w-[60px] rounded-lg bg-white border-white border-4 ' ><img src="one.png" alt="" /></div>
					</div>
				</div>


				{/* Chatbox */}

				<div className='absolute right-0 top-0 bg-[#001655] h-screen w-[27vw]'>
					<div className='relative top-[90vh] w-[25vw] m-auto  '> <input className=' rounded-lg p-3 w-[25vw]' type="text" /></div>
				</div>


			</div>
		</>
	)
}

export default App

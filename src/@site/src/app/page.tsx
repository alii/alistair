'use client';

import {useDeviceSize} from '@alistair/lib/hooks';

export default function Home() {
	return (
		<div className="flex w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] text-white overflow-hidden">
			<aside className="min-w-[290px] max-w-[29px] min-h-[100vh] max-h-[100vh]">aside</aside>
			<main className="flex-1">main</main>
		</div>
	);
}

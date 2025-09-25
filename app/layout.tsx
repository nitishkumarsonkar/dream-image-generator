import React from 'react';
import './globals.css';

export const metadata = {
	title: 'Image Generator',
	description: 'Upload an image and preview it instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
			<html lang="en">
					<body className="min-h-screen">
						{children}
					</body>
				</html>
	);
}

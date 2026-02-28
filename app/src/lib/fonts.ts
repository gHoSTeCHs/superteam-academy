import localFont from 'next/font/local';

export const archivo = localFont({
  src: [
    { path: '../../public/fonts/archivo/Archivo-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/archivo/Archivo-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/archivo/Archivo-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/archivo/Archivo-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const inter = localFont({
  src: '../../public/fonts/inter/Inter-VariableFont_opsz,wght.ttf',
  variable: '--font-body',
  display: 'swap',
});

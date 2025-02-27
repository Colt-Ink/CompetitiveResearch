import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  
  // This part won't be executed due to the redirect
  return null;
}

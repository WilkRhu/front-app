import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { route } from 'next/dist/server/router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.push('/auth/login');
  }, [route]);
  return <div />;
}

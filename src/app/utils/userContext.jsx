'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/app/utils/supabase/supabaseClient';

const UserContext = createContext({
  userId: null,
  isHost: false,
  nowStatus: null,
  setNowStatus: () => {},
});

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [nowStatus, setNowStatus] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from('user_profiles')
        .select('is_host, now_status')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsHost(data.is_host || false);
        setNowStatus(data.now_status || null);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userId, isHost, nowStatus, setNowStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

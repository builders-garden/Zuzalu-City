import { create } from 'zustand';
import { AkashaProfileStats, getProfileStatsByDid } from '@/utils/akasha';

interface AkashaAuthState {
  currentAkashaUser: {
    id?: string;
    ethAddress?: string;
    isNewUser: boolean;
  } | null;
  currentAkashaUserStats: AkashaProfileStats | null | undefined;
  loginAkasha: () => Promise<void>;
}

export const useAkashaAuthStore = create<AkashaAuthState>((set, get) => ({
  currentAkashaUser: null,
  currentAkashaUserStats: null,
  loginAkasha: async () => {
    try {
      // Dynamically import akashaSdk only when needed
      const { default: akashaSdk } = await import('@/utils/akasha/akasha');

      const authRes = await akashaSdk.api.auth.signIn({
        provider: 2, // 2 = Web3Injected
        checkRegistered: false,
        resumeSignIn: false,
      });

      const akashaProfileData = await getProfileStatsByDid(
        authRes.data?.id ?? '',
      );

      set({
        currentAkashaUser: authRes.data,
        currentAkashaUserStats: akashaProfileData,
      });
    } catch (error) {
      console.error('Error logging in to Akasha', error);
    }
  },
}));

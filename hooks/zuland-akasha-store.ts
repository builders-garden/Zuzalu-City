import { create } from 'zustand';

interface AkashaAuthState {
  currentAkashaUser: {
    id?: string;
    ethAddress?: string;
    isNewUser: boolean;
  } | null;
  loginAkasha: () => Promise<void>;
}

export const useAkashaAuthStore = create<AkashaAuthState>((set) => ({
  currentAkashaUser: null,
  loginAkasha: async () => {
    try {
      // Dynamically import akashaSdk only when needed
      const { default: akashaSdk } = await import('@/utils/akasha/akasha');

      const authRes = await akashaSdk.api.auth.signIn({
        provider: 2, // 2 = Web3Injected
        checkRegistered: false,
        resumeSignIn: false,
      });
      set({ currentAkashaUser: authRes.data });
    } catch (error) {
      console.error('Error logging in to Akasha', error);
    }
  },
}));

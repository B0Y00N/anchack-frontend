import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    isSocialLogin: false,
    userProfile: {
      name: "석원",
      nickname: "seokwon",
      avatarUrl: "",
    },
  }),
  actions: {
    login({ social = false } = {}) {
      this.isLoggedIn = true;
      this.isSocialLogin = social;
    },
    logout() {
      this.isLoggedIn = false;
      this.isSocialLogin = false;
    },
    updateProfile(profile) {
      this.userProfile = { ...this.userProfile, ...profile };
    },
  },
});

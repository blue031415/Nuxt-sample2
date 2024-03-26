import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { onMounted, ref, computed } from "vue";

const useAuth = () => {
  const nuxtApp = useNuxtApp();
  const supabase = nuxtApp.$supabase as SupabaseClient;
  const session = ref<Session | null>(null);
  const error = ref<string>("");

  onMounted(() => {
    const { data: authData } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        session.value = newSession;
      },
    );
    return () => {
      authData.subscription.unsubscribe();
    };
  });

  const signInWithGithub = async () => {
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (signInError) {
        error.value = signInError.message;
      }
    } catch (signInException) {
      if (signInException instanceof Error) {
        error.value = signInException.message;
      } else if (typeof signInException === "string") {
        error.value = signInException;
      } else {
        console.error("GitHubとの連携に失敗しました。");
      }
    }
  };

  const profileFromGithub = computed(() => {
    return {
      nickName: session.value?.user?.user_metadata?.user_name || "",
      avatarUrl: session.value?.user?.user_metadata?.avatar_url || "",
    };
  });

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    session,
    error,
    profileFromGithub,
    signInWithGithub,
    signOut,
  };
};

export default useAuth;
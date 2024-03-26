import { ref, onMounted } from "vue";
import type { Database } from "@/types/schema";
import { SupabaseClient } from "@supabase/supabase-js";

export default function useSupabase() {
  const nuxtApp = useNuxtApp();
  const supabase = nuxtApp.$supabase as SupabaseClient;

  const data = ref<Database["public"]["Tables"]["messages"]["Row"][] | null>(
    null,
  );

  const TABLE_NAME = "messages";

  const fetchDatabase = async () => {
    try {
      const { data: fetchedData } = await supabase
        .from(TABLE_NAME) // messagesテーブルを指定
        .select("*") // 全てのカラムを取得
        .order("createdAt"); // createdAtカラムでソート
      data.value = fetchedData;
    } catch (error) {
      console.error(error);
    }
  };

  onMounted(fetchDatabase); // Mounted時にデータをフェッチ

  const deletedSupabaseData = async (id: string) => {
    try {
      await supabase.from(TABLE_NAME).delete().match({ id: id }); // 指定したIDの行を削除
    } catch (error) {
      console.error(error);
    }
  };
  const editedSupabaseData = async (id: string, text: string) => {
    try {
      await supabase.from(TABLE_NAME).update({ message: text }).match({ id }); // 指定したIDの行を更新
    } catch (error) {
      console.error(error);
    }
  };
  const addSupabaseData = async ({
    message,
    avatarUrl,
    nickName,
  }: Pick<
    Database["public"]["Tables"]["messages"]["Row"],
    "message" | "nickName" | "avatarUrl"
  >) => {
    try {
      await supabase.from(TABLE_NAME).insert({ message, avatarUrl, nickName });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    TABLE_NAME,
    data,
    fetchDatabase,
    addSupabaseData,
    deletedSupabaseData,
    editedSupabaseData,
  };
}
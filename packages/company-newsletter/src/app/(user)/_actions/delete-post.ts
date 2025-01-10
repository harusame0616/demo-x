"use server";

import { fail } from "assert";
import * as v from "valibot";

import { createAction } from "@/lib/next-file/server-action";
import { succeed } from "@/lib/result";
import { createClientServiceRole } from "@/lib/supabase/service-role";

export const deletePost = createAction(
  async (params) => {
    const client = createClientServiceRole().schema("X_DEMO");

    const result = await client
      .from("post")
      .delete()
      .eq("postId", params.postId);

    if (result.error) {
      return fail("投稿に失敗しました");
    }
    return succeed();
  },
  {
    inputSchema: { postId: v.pipe(v.string()) },
    revalidatePaths: ["/"],
  },
);
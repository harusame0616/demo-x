"use server";

import { fail } from "assert";
import * as v from "valibot";

import { succeed } from "@/lib/result";
import { createAction } from "@/lib/server-action";
import { createClientServiceRole } from "@/lib/supabase/service-role";

export const editPost = createAction(
  async (params) => {
    const client = createClientServiceRole();

    const post = await client
      .schema("X_DEMO")
      .from("post")
      .select("*")
      .eq("postId", params.postId)
      .single();

    console.log(params);
    if (post.error) {
      console.log(post);
      throw new Error("error");
    }

    const newAttachments = [
      ...post.data.attachments.filter(
        (attachment: string) => !params.deleteAttachments.includes(attachment),
      ),
      ...params.attachments,
    ];

    const result = await client
      .schema("X_DEMO")
      .from("post")
      .update({
        title: params.title,
        text: params.text,
        attachments: newAttachments,
      })
      .eq("postId", params.postId);

    if (result.error) {
      console.log(post);
      return fail("投稿に失敗しました");
    }

    const removeResult = await client.storage
      .from("attachment")
      .remove(params.deleteAttachments);
    console.log({ removeResult });

    return succeed();
  },
  {
    inputSchema: v.object({
      postId: v.pipe(v.string()),
      title: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      text: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      deleteAttachments: v.array(v.string()),
      attachments: v.array(
        v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
      ),
    }),
    revalidatePaths: ["/"],
  },
);
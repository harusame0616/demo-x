"use client";

import { LinkIcon, TrashIcon, UndoIcon, UnlinkIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { uuidv7 } from "uuidv7";
import * as v from "valibot";

import { Form, FormItem } from "@/components/form/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { decodeBase64, encodeToBase64 } from "@/lib/base64";
import { commentTextSchema } from "@/lib/comment";
import { Result } from "@/lib/result";
import { createClient } from "@/lib/supabase/browser";
import { useForm } from "@/lib/use-form";
import { cn } from "@/lib/utils";

type UserInputFormProps =
  | {
      onSuccess?: () => void;
      action: (params: {
        postId: string;
        text: string;
        attachments: string[];
      }) => Promise<Result>;
      comment?: never;
      postId: string;
    }
  | {
      onSuccess?: () => void;
      action: (params: {
        commentId: string;
        text: string;
        deleteAttachments: string[];
        attachments: string[];
      }) => Promise<Result>;
      comment: {
        commentId: string;
        text: string;
        attachments: string[];
      };
      postId: string;
    };
export function CommentInputForm(props: UserInputFormProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(uuidv7());
  const [deleteFiles, setDeleteFiles] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: {
      text: props.comment?.text ?? "",
    },
    schema: v.object({
      text: commentTextSchema,
    }),

    onSubmit: async (params, setErrorMessage) => {
      setErrorMessage("");

      const client = createClient();

      const uploadResults = await Promise.all(
        attachments.map((attachment) =>
          client.storage
            .from("attachments")
            .upload(
              `${uuidv7()}/${encodeToBase64(attachment.name)}`,
              attachment,
            ),
        ),
      );

      let actionResult;
      if (props.comment) {
        actionResult = await props.action({
          ...params,
          commentId: props.comment.commentId,
          deleteAttachments: deleteFiles,
          attachments: uploadResults.map((r) => r.data?.path),
        });
      } else {
        actionResult = await props.action({
          ...params,
          postId: props.postId,
          attachments: uploadResults.map((r) => r.data?.path),
        });
      }

      if (!actionResult.success) {
        setErrorMessage(actionResult.message);
      } else {
        props.onSuccess?.();
      }
    },
  });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      throw new Error("error");
    }
    setAttachments((current) => [...current, file]);
    setFileKey(uuidv7());
  }

  return (
    <Form {...form} submitButtonLabel="投稿する">
      <FormField
        control={form.control}
        name="text"
        render={({ field }) => (
          <FormItem label="本文" required>
            <Textarea
              {...field}
              rows={5}
              className="w-full "
              disabled={form.formState.isSubmitting}
            />
          </FormItem>
        )}
      />

      <div>
        <label className="text-sm font-bold">添付</label>
        <div className="flex flex-col gap-1">
          {props.comment?.attachments.map((attachment) => (
            <div key={attachment} className="grid grid-cols-[1fr,auto] gap-2">
              <div className="flex items-center gap-1 break-all">
                {deleteFiles.includes(attachment) ? (
                  <UnlinkIcon
                    className="size-4 shrink-0"
                    role="img"
                    aria-label="削除予定ファイル"
                  />
                ) : (
                  <LinkIcon
                    className="size-4 shrink-0"
                    role="img"
                    aria-label="アップロード済みファイル"
                  />
                )}
                <span
                  className={cn(
                    deleteFiles.includes(attachment) && "line-through",
                  )}
                >
                  {decodeBase64(attachment.split("/")[1])}
                </span>
              </div>
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={() => {
                  if (deleteFiles.includes(attachment)) {
                    setDeleteFiles((current) =>
                      current.filter((a) => a !== attachment),
                    );
                  } else {
                    setDeleteFiles((current) => [...current, attachment]);
                  }
                }}
              >
                {deleteFiles.includes(attachment) ? (
                  <UndoIcon />
                ) : (
                  <TrashIcon />
                )}
              </Button>
            </div>
          ))}
          {attachments.map((attachment, i) => {
            return (
              // 同じファイル名の場合にエラーになってしまうので i を key にする
              <div key={i} className="grid grid-cols-[1fr,auto] gap-2">
                <Input
                  className="text-sm text-muted-foreground"
                  readOnly
                  defaultValue={attachment.name}
                />
                <Button
                  size="icon"
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setAttachments((current) => {
                      const currentCopy = [...current];
                      currentCopy.splice(i, 1);
                      return currentCopy;
                    });
                  }}
                >
                  <TrashIcon />
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-1">
          <Input
            type="file"
            onChange={onChange}
            ref={fileInputRef}
            key={fileKey}
          />
        </div>
      </div>
    </Form>
  );
}

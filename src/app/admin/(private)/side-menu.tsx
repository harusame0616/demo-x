import {
  AtSign,
  ChevronsUpDownIcon,
  LockKeyholeIcon,
  LogOutIcon,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import UserImage from "./user.png";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";

const items = [
  {
    title: "ユーザー一覧",
    url: "/admin/users",
    icon: User,
  },
];

export async function SideMenuContainer() {
  const supabaseClient = await createClient();
  const getUserResult = await supabaseClient.auth.getUser();
  if (getUserResult.error || !getUserResult.data) {
    throw new Error("Not authenticated");
  }
  const name = getUserResult.data.user.user_metadata.name;
  const email = getUserResult.data.user.email!;

  return <SideMenuPresenter name={name} email={email} />;
}

export function SideMenuPresenter(
  props:
    | {
        skeleton?: false;
        email: string;
        name: string;
      }
    | { skeleton: true }
) {
  return (
    <Sidebar>
      <SidebarHeader>Admin</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menus</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="grid grid-cols-[1fr_auto] items-center">
              {props.skeleton ? (
                <UserMiniProfile skeleton />
              ) : (
                <UserMiniProfile name={props.name} email={props.email} />
              )}
              <ChevronsUpDownIcon />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mb-2 ml-1 max-w-64" side="right">
            <DropdownMenuLabel>
              {props.skeleton ? (
                <UserMiniProfile skeleton />
              ) : (
                <UserMiniProfile name={props.name} email={props.email} />
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LockKeyholeIcon />
              パスワード更新
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AtSign />
              メールアドレス更新
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

type UserMiniProfileProps =
  | {
      skeleton?: false;
      name: string;
      email: string;
    }
  | { skeleton: true };
function UserMiniProfile(props: UserMiniProfileProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
      <Avatar>
        <Image src={UserImage} alt={""} />
        <AvatarFallback>
          {props.skeleton ? "" : props.name.at(0)}
        </AvatarFallback>
      </Avatar>
      <div className="grid grid-rows-2 font-normal">
        <div className="truncate ">
          {props.skeleton ? <Skeleton className="h-4 w-12 my-1" /> : props.name}
        </div>
        <div className="truncate text-muted-foreground">
          {props.skeleton ? (
            <Skeleton className="h-4 w-24 my-1" />
          ) : (
            props.email
          )}
        </div>
      </div>
    </div>
  );
}

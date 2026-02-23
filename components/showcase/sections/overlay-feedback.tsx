"use client"

import { useState } from "react"
import {
  Cloud,
  CreditCard,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  User,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { ShowcaseCard } from "@/components/showcase/showcase-card"

export function OverlayFeedbackSection() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [position, setPosition] = useState("bottom")

  return (
    <div className="space-y-6">
      <ShowcaseCard title="Dialog" description="모달 다이얼로그">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">프로필 수정</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>프로필 수정</DialogTitle>
              <DialogDescription>
                프로필 정보를 수정하세요. 완료되면 저장 버튼을 클릭하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dialog-name">이름</Label>
                <Input id="dialog-name" defaultValue="홍길동" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dialog-email">이메일</Label>
                <Input
                  id="dialog-email"
                  defaultValue="hong@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShowcaseCard>

      <ShowcaseCard title="Sheet" description="4방향 슬라이드 패널">
        <div className="flex flex-wrap gap-3">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  {side === "top"
                    ? "위"
                    : side === "right"
                      ? "오른쪽"
                      : side === "bottom"
                        ? "아래"
                        : "왼쪽"}
                </Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Sheet ({side})</SheetTitle>
                  <SheetDescription>
                    {side} 방향에서 열리는 Sheet 패널입니다.
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4">
                  <p className="text-muted-foreground text-sm">
                    여기에 내용을 추가할 수 있습니다.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Tooltip" description="4방향 툴팁">
        <TooltipProvider>
          <div className="flex flex-wrap gap-3">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    {side === "top"
                      ? "위"
                      : side === "right"
                        ? "오른쪽"
                        : side === "bottom"
                          ? "아래"
                          : "왼쪽"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={side}>
                  <p>{side} 방향 툴팁</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </ShowcaseCard>

      <ShowcaseCard title="Popover" description="팝오버 (폼 포함)">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">팝오버 열기</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="leading-none font-medium">치수 설정</h4>
                <p className="text-muted-foreground text-sm">
                  레이어의 치수를 설정하세요.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">너비</Label>
                  <Input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">높이</Label>
                  <Input
                    id="height"
                    defaultValue="auto"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </ShowcaseCard>

      <ShowcaseCard
        title="Dropdown Menu"
        description="체크박스, 라디오, 서브메뉴 포함"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">메뉴 열기</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                <span>프로필</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                <span>결제</span>
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                <span>설정</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                상태 바
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showPanel}
                onCheckedChange={setShowPanel}
              >
                패널
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={position}
              onValueChange={setPosition}
            >
              <DropdownMenuRadioItem value="top">상단</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">
                하단
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">
                우측
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserPlus />
                <span>사용자 초대</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail />
                  <span>이메일</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare />
                  <span>메시지</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus />
                  <span>기타...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Cloud />
              <span>API</span>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <LogOut />
              <span>로그아웃</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ShowcaseCard>

      <ShowcaseCard title="Toast" description="다양한 유형의 알림">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast.success("성공", {
                description: "작업이 성공적으로 완료되었습니다.",
              })
            }
          >
            성공
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("정보", {
                description: "새로운 업데이트가 있습니다.",
              })
            }
          >
            정보
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.warning("경고", {
                description: "저장 공간이 부족합니다.",
              })
            }
          >
            경고
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error("오류", {
                description: "요청을 처리하지 못했습니다.",
              })
            }
          >
            에러
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 2000)),
                {
                  loading: "처리 중...",
                  success: "완료되었습니다!",
                  error: "오류가 발생했습니다.",
                }
              )
            }
          >
            로딩
          </Button>
        </div>
      </ShowcaseCard>
    </div>
  )
}

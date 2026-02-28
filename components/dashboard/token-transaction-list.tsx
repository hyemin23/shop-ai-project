"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { type TokenTransaction } from "@/types/payment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const TYPE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  charge: { label: "충전", variant: "default" },
  spend: { label: "사용", variant: "destructive" },
  refund: { label: "환불", variant: "secondary" },
  bonus: { label: "보너스", variant: "outline" },
};

export function TokenTransactionList() {
  const { user } = useAuth();
  const [items, setItems] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  const fetchTransactions = useCallback(
    async (reset = false) => {
      if (!user) return;
      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;

      try {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(currentOffset),
        });
        if (typeFilter !== "all") params.set("type", typeFilter);

        const res = await fetch(`/api/tokens/transactions?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (reset) {
            setItems(data.items);
            setOffset(data.items.length);
          } else {
            setItems((prev) => [...prev, ...data.items]);
            setOffset((prev) => prev + data.items.length);
          }
          setHasMore(data.items.length === limit);
        }
      } catch {
        // 조용히 실패
      } finally {
        setIsLoading(false);
      }
    },
    [user, offset, typeFilter],
  );

  useEffect(() => {
    fetchTransactions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, typeFilter]);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          로그인 후 사용 내역을 확인할 수 있습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">토큰 사용 내역</CardTitle>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="charge">충전</SelectItem>
            <SelectItem value="spend">사용</SelectItem>
            <SelectItem value="refund">환불</SelectItem>
            <SelectItem value="bonus">보너스</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {items.length === 0 && !isLoading ? (
          <p className="py-8 text-center text-muted-foreground">
            아직 거래 내역이 없습니다.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">잔액</TableHead>
                  <TableHead className="text-right">날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const typeInfo = TYPE_LABELS[item.type] ?? {
                    label: item.type,
                    variant: "secondary" as const,
                  };
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.description}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${item.amount > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.amount > 0 ? "+" : ""}
                        {item.amount}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("ko-KR").format(item.balance)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchTransactions(false)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  더 보기
                </Button>
              </div>
            )}
          </>
        )}

        {isLoading && items.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = 'user' | 'admin';
export type AccountStatus = 'phase1' | 'phase2' | 'funded' | 'breached' | 'passed' | 'closed';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
export type CloseReason = 'MANUAL' | 'SL' | 'TP' | 'LIQUIDATION' | 'BREACH' | 'ADMIN';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: ProfileRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: ProfileRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: ProfileRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          starting_balance: number;
          price_usd: number;
          phase1_target_pct: number;
          phase2_target_pct: number;
          max_daily_loss_pct: number;
          max_total_drawdown_pct: number;
          min_trading_days: number;
          max_leverage: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          starting_balance: number;
          price_usd: number;
          phase1_target_pct?: number;
          phase2_target_pct?: number;
          max_daily_loss_pct?: number;
          max_total_drawdown_pct?: number;
          min_trading_days?: number;
          max_leverage?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          starting_balance?: number;
          price_usd?: number;
          phase1_target_pct?: number;
          phase2_target_pct?: number;
          max_daily_loss_pct?: number;
          max_total_drawdown_pct?: number;
          min_trading_days?: number;
          max_leverage?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      trading_accounts: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          account_number: string;
          status: AccountStatus;
          initial_balance: number;
          current_balance: number;
          current_equity: number;
          margin_used: number;
          free_margin: number;
          high_water_mark: number;
          day_start_equity: number;
          current_trading_day: string;
          trading_days_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          account_number: string;
          status?: AccountStatus;
          initial_balance: number;
          current_balance: number;
          current_equity: number;
          margin_used?: number;
          free_margin: number;
          high_water_mark: number;
          day_start_equity: number;
          current_trading_day?: string;
          trading_days_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          account_number?: string;
          status?: AccountStatus;
          initial_balance?: number;
          current_balance?: number;
          current_equity?: number;
          margin_used?: number;
          free_margin?: number;
          high_water_mark?: number;
          day_start_equity?: number;
          current_trading_day?: string;
          trading_days_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          account_id: string;
          symbol: string;
          side: OrderSide;
          type: OrderType;
          requested_price: number;
          executed_price: number | null;
          size: number;
          leverage: number;
          stop_loss: number | null;
          take_profit: number | null;
          status: OrderStatus;
          created_at: string;
          executed_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          symbol: string;
          side: OrderSide;
          type?: OrderType;
          requested_price: number;
          executed_price?: number | null;
          size: number;
          leverage?: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          status?: OrderStatus;
          created_at?: string;
          executed_at?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string;
          symbol?: string;
          side?: OrderSide;
          type?: OrderType;
          requested_price?: number;
          executed_price?: number | null;
          size?: number;
          leverage?: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          status?: OrderStatus;
          created_at?: string;
          executed_at?: string | null;
        };
      };
      positions: {
        Row: {
          id: string;
          account_id: string;
          order_id: string | null;
          symbol: string;
          side: OrderSide;
          size: number;
          entry_price: number;
          current_price: number;
          leverage: number;
          margin: number;
          stop_loss: number | null;
          take_profit: number | null;
          unrealized_pnl: number;
          opened_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          order_id?: string | null;
          symbol: string;
          side: OrderSide;
          size: number;
          entry_price: number;
          current_price: number;
          leverage: number;
          margin: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          unrealized_pnl?: number;
          opened_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          order_id?: string | null;
          symbol?: string;
          side?: OrderSide;
          size?: number;
          entry_price?: number;
          current_price?: number;
          leverage?: number;
          margin?: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          unrealized_pnl?: number;
          opened_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          account_id: string;
          position_id: string | null;
          symbol: string;
          side: OrderSide;
          size: number;
          entry_price: number;
          exit_price: number;
          realized_pnl: number;
          fee: number;
          close_reason: CloseReason;
          journal_notes: string | null;
          opened_at: string;
          closed_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          position_id?: string | null;
          symbol: string;
          side: OrderSide;
          size: number;
          entry_price: number;
          exit_price: number;
          realized_pnl: number;
          fee?: number;
          close_reason?: CloseReason;
          journal_notes?: string | null;
          opened_at: string;
          closed_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          position_id?: string | null;
          symbol?: string;
          side?: OrderSide;
          size?: number;
          entry_price?: number;
          exit_price?: number;
          realized_pnl?: number;
          fee?: number;
          close_reason?: CloseReason;
          journal_notes?: string | null;
          opened_at?: string;
          closed_at?: string;
        };
      };
      equity_snapshots: {
        Row: {
          id: string;
          account_id: string;
          equity: number;
          balance: number;
          daily_pnl: number;
          drawdown_pct: number;
          snapshot_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          equity: number;
          balance: number;
          daily_pnl?: number;
          drawdown_pct?: number;
          snapshot_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          equity?: number;
          balance?: number;
          daily_pnl?: number;
          drawdown_pct?: number;
          snapshot_at?: string;
        };
      };
      rule_events: {
        Row: {
          id: string;
          account_id: string;
          event_type: string;
          rule_name: string;
          threshold_value: number | null;
          breached_value: number | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          event_type: string;
          rule_name: string;
          threshold_value?: number | null;
          breached_value?: number | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          event_type?: string;
          rule_name?: string;
          threshold_value?: number | null;
          breached_value?: number | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      payouts: {
        Row: {
          id: string;
          account_id: string;
          requested_amount: number;
          profit_split_pct: number;
          payout_amount: number;
          status: PayoutStatus;
          admin_notes: string | null;
          requested_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          requested_amount: number;
          profit_split_pct?: number;
          payout_amount: number;
          status?: PayoutStatus;
          admin_notes?: string | null;
          requested_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string;
          requested_amount?: number;
          profit_split_pct?: number;
          payout_amount?: number;
          status?: PayoutStatus;
          admin_notes?: string | null;
          requested_at?: string;
          processed_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          stripe_session_id: string | null;
          stripe_payment_intent: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          created_at?: string;
        };
      };
    };
  };
}


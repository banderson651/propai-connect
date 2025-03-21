export interface Property {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  property_type?: string;
  status: 'active' | 'inactive' | 'sold';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'cold' | 'warm' | 'hot';
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  user_id: string;
  type: 'email' | 'whatsapp';
  direction: 'sent' | 'received';
  recipient?: string;
  subject?: string;
  content?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>;
      };
      communications: {
        Row: Communication;
        Insert: Omit<Communication, 'id' | 'created_at'>;
        Update: Partial<Omit<Communication, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 
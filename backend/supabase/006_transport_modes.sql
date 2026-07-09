-- Phase 2: Transport Mode Per Task
-- Add transport_mode to errands and create a log table for transport mode changes

-- Add transport_mode column to errands table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'errands' AND column_name = 'transport_mode') THEN
        ALTER TABLE errands ADD COLUMN transport_mode text DEFAULT 'foot' CHECK (transport_mode IN ('foot', 'bike', 'vehicle'));
    END IF;
END $$;

-- Create task_transport_log table
CREATE TABLE IF NOT EXISTS task_transport_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  errand_id uuid REFERENCES errands(id) ON DELETE CASCADE,
  mode text NOT NULL,
  changed_at timestamptz DEFAULT now()
);

-- RLS for task_transport_log
ALTER TABLE task_transport_log ENABLE ROW LEVEL SECURITY;

-- Allow runners to insert their own logs
CREATE POLICY "Runners can insert their own transport logs" ON task_transport_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM errands WHERE id = task_transport_log.errand_id AND runner_id = auth.uid())
  );

-- Allow customers to read logs for their own errands
CREATE POLICY "Customers can read transport logs for their errands" ON task_transport_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM errands WHERE id = task_transport_log.errand_id AND customer_id = auth.uid())
  );

-- Allow runners to read logs for their own errands
CREATE POLICY "Runners can read transport logs for their errands" ON task_transport_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM errands WHERE id = task_transport_log.errand_id AND runner_id = auth.uid())
  );

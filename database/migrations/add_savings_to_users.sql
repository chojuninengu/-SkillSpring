-- Add savings fields to users table
ALTER TABLE users
ADD COLUMN savings_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN savings_goal DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN savings_last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create savings history table
CREATE TABLE savings_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update savings_last_updated
CREATE OR REPLACE FUNCTION update_savings_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.savings_last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for savings updates
CREATE TRIGGER update_savings_timestamp
    BEFORE UPDATE OF savings_amount
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_last_updated(); 
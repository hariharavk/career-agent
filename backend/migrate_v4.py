import sqlite3

def run_migration():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE jobs ADD COLUMN external_id VARCHAR;")
        print("Added external_id column.")
    except sqlite3.OperationalError as e:
        print(f"Column external_id might already exist: {e}")
        
    try:
        cursor.execute("ALTER TABLE jobs ADD COLUMN yoe VARCHAR;")
        print("Added yoe column.")
    except sqlite3.OperationalError as e:
        print(f"Column yoe might already exist: {e}")
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    run_migration()

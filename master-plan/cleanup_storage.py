import os
import sys
from supabase import create_client

# Suppress debug logs from httpx
import logging
logging.getLogger("httpx").setLevel(logging.WARNING)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

buckets_to_clean = ["event-evidence", "event-photos", "video-clips"]

print("Starting Supabase Storage Cleanup...")

for bucket_name in buckets_to_clean:
    print(f"\nScanning bucket: {bucket_name}")
    try:
        # First check if the bucket exists by trying to list its contents (or get info)
        # Using a simple list with small limit to test access
        response = supabase.storage.from_(bucket_name).list()
        
        # If response is a list, the bucket exists and we can access it
        files_to_delete = []
        for file_obj in response:
            if file_obj['name'] != '.emptyFolderPlaceholder': # Supabase sometimes creates this
                files_to_delete.append(file_obj['name'])
        
        # Keep fetching if there might be more (pagination)
        # For simplicity in this script, we'll try to fetch up to 1000 items
        # If there are deeply nested folders, a recursive function would be needed, 
        # but for simple flat structures this works.
        # Let's use a queue for folders if needed, but usually these buckets have simple structures.
        
        # To be safe and thorough, let's just attempt a flat clean first.
        
        all_files = []
        def get_all_files(path=""):
            res = supabase.storage.from_(bucket_name).list(path)
            for item in res:
                item_path = f"{path}/{item['name']}" if path else item['name']
                # Supabase storage list returns implicit folders without an ID, or files with an ID
                # Actually, files usually have 'id', folders don't (just 'name')
                if item.get('id'):
                    all_files.append(item_path)
                elif item['name'] != '.emptyFolderPlaceholder' and not item.get('id'):
                    # It's a folder, recurse
                    get_all_files(item_path)
        
        get_all_files()
        
        if not all_files:
            print(f"Bucket '{bucket_name}' is already empty or has no accessible files.")
            continue
            
        print(f"Found {len(all_files)} files in '{bucket_name}'.")
        
        # Supabase API allows deleting multiple files at once by passing an array of paths
        print(f"Deleting files in '{bucket_name}'...")
        # Batch delete in chunks of 100 to avoid request URL length limits
        chunk_size = 100
        for i in range(0, len(all_files), chunk_size):
            chunk = all_files[i:i + chunk_size]
            res = supabase.storage.from_(bucket_name).remove(chunk)
            print(f" - Deleted batch of {len(chunk)} files.")
            
        print(f"Successfully cleaned bucket: {bucket_name}")

    except Exception as e:
        print(f"Error processing bucket '{bucket_name}': {e}")
        # Could be that the bucket doesn't exist
        print("Moving to next bucket...")

print("\nCleanup Script Finished.")

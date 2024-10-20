"use client";

import React, { useState, useEffect } from 'react';

import { getAllProfiles } from '@/actions/profile-actions';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/columns';


// Import the profiles type from database.types.ts
import { Database } from '@/database.types';

// Define a type alias for the profile row
type ProfileRow = Database['public']['Tables']['profile']['Row'];

export default function AdminClientPage() {
    // State to hold user data
    const [profiles, setProfiles] = useState<ProfileRow[]>([]);

    
    useEffect(() => {
        const fetchUsers = async () => {
            const profiles = await getAllProfiles();
            setProfiles(profiles);
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Admin Page</h1>
            <DataTable columns={columns} data={profiles} />
        </div>
    );
}

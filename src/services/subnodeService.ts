import { useState, useEffect } from 'react';
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaces based on API response
export interface SubnodeListItem {
  id: string;
  name: string;
  description: string;
  node_family: string;
  node_family_name: string;
  active_version: number | null;
  published: boolean;
  original_version: number;
  version_comment: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface SubnodesListResponse {
  total: number;
  published: number;
  draft: number;
  results: SubnodeListItem[];
}

export interface ParameterValue {
  id: string;
  parameter_key: string;
  value: string;
}

export interface SubnodeVersion {
  id: string;
  version: number;
  is_deployed: boolean;
  is_editable: boolean;
  updated_at: string;
  updated_by: string;
  version_comment: string | null;
  parameter_values: ParameterValue[];
}

export interface SubnodeParameterValuesByVersion {
  node_version: number;
  parameter_values: Array<{
    parameter_key: string;
    value: string;
    default_value: string;
    datatype: string;
    source: string;
  }>;
}

export interface SubnodeVersionWithParametersByNodeVersion extends SubnodeVersion {
  parameter_values_by_nodeversion?: SubnodeParameterValuesByVersion[];
}

export interface SubnodeDetail {
  id: string;
  name: string;
  description: string;
  node?: string;
  node_family: {
    id: string;
    name: string;
  };
  active_version: number | null;
  published: boolean;
  published_version?: SubnodeVersionWithParametersByNodeVersion;
  last_version?: SubnodeVersionWithParametersByNodeVersion;
  original_version: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  versions: SubnodeVersionWithParametersByNodeVersion[];
}

export interface CreateSubnodeResponse {
  name: string;
  description: string;
  node_family: string;
  id?: string; // Sometimes included in response
}

export interface CreateSubnodeRequest {
  name: string;
  description: string;
  node_family: string;
}

export interface ParameterValueRequest {
  id: string;
  value: string;
}

export interface EditWithParametersRequest {
  name?: string;
  description?: string;
  parameter_values?: ParameterValueRequest[];
}

export interface CloneSubnodeRequest {
  name?: string;
  [key: string]: any;
}

export interface CreateEditableVersionRequest {
  version_comment: string;
}

export interface VersionDetail {
  id: string;
  name: string;
  description: string;
  node: string;
  version: number;
  version_comment: string;
  is_deployed: boolean;
  is_editable: boolean;
  parameter_values: ParameterValue[];
}

// API Service Functions
export const subnodeService = {
  // List all subnodes
  async getAllSubnodes(): Promise<SubnodesListResponse> {
    const response = await axiosInstance.get('subnodes/');
    return response.data;
  },

  // Get single subnode detail
  async getSubnode(id: string): Promise<SubnodeDetail> {
    const response = await axiosInstance.get(`subnodes/${id}/`);
    return response.data;
  },

  // Update subnode (PATCH)
  async updateSubnode(id: string, data: Partial<SubnodeDetail>): Promise<SubnodeDetail> {
    const response = await axiosInstance.patch(`subnodes/${id}/`, data);
    return response.data;
  },

  // Delete subnode (all versions)
  async deleteSubnode(id: string): Promise<{ detail: string }> {
    const response = await axiosInstance.delete(`subnodes/${id}/`);
    return response.data;
  },

  // Create new subnode
  async createSubnode(data: CreateSubnodeRequest): Promise<CreateSubnodeResponse> {
    const response = await axiosInstance.post('subnodes/', data);
    return response.data;
  },

  // Update parameter values
  async updateParameterValues(id: string, version: number, parameterValues: ParameterValueRequest[]): Promise<any> {
    const response = await axiosInstance.patch(`subnodes/${id}/update_parameter_values/`, {
      version,
      parameter_values: parameterValues
    });
    return response.data;
  },

  // Edit subnode with parameters
  async editWithParameters(id: string, data: EditWithParametersRequest): Promise<any> {
    const response = await axiosInstance.patch(`subnodes/${id}/edit_with_parameters/`, data);
    return response.data;
  },

  // Create editable version from active
  async createEditableVersion(id: string, data: CreateEditableVersionRequest): Promise<SubnodeDetail> {
    const response = await axiosInstance.post(`subnodes/${id}/create_editable_version/`, data);
    return response.data;
  },

  // Activate/Deploy specific version
  async activateVersion(id: string, version: number): Promise<{ id: string; name: string; is_deployed: boolean; version: number; message: string }> {
    const response = await axiosInstance.post(`subnodes/${id}/activate_version/${version}/`);
    return response.data;
  },

  // Undeploy specific version
  async undeployVersion(id: string, version: number): Promise<{ message: string }> {
    const response = await axiosInstance.post(`subnodes/${id}/undeploy_version/${version}/`);
    return response.data;
  },

  // Export subnode
  async exportSubnode(id: string): Promise<any> {
    const response = await axiosInstance.get(`subnodes/${id}/export/`);
    return response.data;
  },

  // Import subnode
  async importSubnode(file: File): Promise<SubnodeDetail> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('subnodes/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Clone subnode
  async cloneSubnode(id: string, data?: CloneSubnodeRequest): Promise<SubnodeDetail> {
    const response = await axiosInstance.post(`subnodes/${id}/clone/`, data || {});
    return response.data;
  },

  // Delete specific version
  async deleteSubnodeVersion(id: string, version: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`subnodes/${id}/delete_version/${version}/`);
    return response.data;
  },

  // Delete all versions
  async deleteAllVersions(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`subnodes/${id}/delete_all_versions/`);
    return response.data;
  },

  // Get version detail by fetching subnode and finding the specific version
  async getVersionDetail(id: string, version: number): Promise<VersionDetail> {
    const subnode = await this.getSubnode(id);
    const versionData = subnode.versions.find(v => v.version === version);
    
    if (!versionData) {
      throw new Error(`Version ${version} not found for subnode ${id}`);
    }
    
    return {
      id: versionData.id,
      name: subnode.name,
      description: subnode.description,
      node: subnode.node || subnode.node_family?.id || '',
      version: versionData.version,
      version_comment: versionData.version_comment || '',
      is_deployed: versionData.is_deployed,
      is_editable: versionData.is_editable,
      parameter_values: versionData.parameter_values
    };
  },
};

// Custom hook for fetching all subnodes
export const useSubnodes = () => {
  const [data, setData] = useState<SubnodesListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubnodes = async () => {
      try {
        const subnodes = await subnodeService.getAllSubnodes();
        setData(subnodes);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Error fetching subnodes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSubnodes();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const subnodes = await subnodeService.getAllSubnodes();
      setData(subnodes);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error fetching subnodes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Custom hook for fetching single subnode
export const useSubnode = (id: string) => {
  const [data, setData] = useState<SubnodeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadSubnode = async () => {
      try {
        setLoading(true);
        const subnode = await subnodeService.getSubnode(id);
        setData(subnode);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Error fetching subnode');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSubnode();
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const subnode = await subnodeService.getSubnode(id);
      setData(subnode);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error fetching subnode');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Custom hook that returns versions from subnode data
export const useSubnodeVersions = (subnodeData: SubnodeDetail | null) => {
  const data = subnodeData?.versions || [];
  const loading = false;
  const error = null;

  const refetch = () => {
    // Versions are part of subnode data, so refetch is handled by parent
  };

  return { data, loading, error, refetch };
};
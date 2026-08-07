import { useState } from 'react';
import { Alert, Badge, Button, Card, Modal, Spinner, Table } from 'react-bootstrap';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from '@/features/roles/rolesApi';
import { RoleForm, type RoleFormValues } from '@/features/roles/components/RoleForm';
import { permissionKey } from '@/features/roles/permissionGroups';
import { useAppSelector } from '@/app/hooks';
import type { Role } from '@/types/role';

const emptyFormValues: RoleFormValues = { name: '', description: '', permissionKeys: [] };

function toFormValues(role: Role): RoleFormValues {
  return {
    name: role.name,
    description: role.description ?? '',
    permissionKeys: role.permissions.map((permission) => permissionKey(permission.action, permission.subject)),
  };
}

export default function AdminRolesPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: allRoles, isLoading } = useGetRolesQuery();
  const roles = allRoles?.filter((role) => role.id !== currentUser?.staffRole?.id);
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function openCreate() {
    setEditingRole(null);
    setShowModal(true);
  }

  function openEdit(role: Role) {
    setEditingRole(role);
    setShowModal(true);
  }

  async function handleSubmit(values: RoleFormValues) {
    const body = {
      name: values.name,
      description: values.description || undefined,
      permissions: values.permissionKeys.map((key) => {
        const [action, subject] = key.split(':');
        return { action, subject };
      }),
    };

    if (editingRole) {
      await updateRole({ id: editingRole.id, body }).unwrap();
      setSuccess(`${values.name} updated successfully.`);
    } else {
      await createRole(body).unwrap();
      setSuccess(`${values.name} created successfully.`);
    }
    setShowModal(false);
  }

  async function handleDelete(role: Role) {
    setError('');
    setSuccess('');
    try {
      await deleteRole(role.id).unwrap();
      setSuccess(`${role.name} deleted.`);
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Unable to delete this role right now.');
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <p className="text-primary fw-semibold mb-1">Access control</p>
          <h1 className="fs-3 fw-bold">Roles</h1>
          <p className="text-secondary mb-0">Define staff roles and the permissions each one carries.</p>
        </div>
        <Button variant="dark" className="d-inline-flex align-items-center gap-2" onClick={openCreate}>
          <Plus size={18} />
          Create role
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card className="border-0 shadow-sm rounded-4 mt-3">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Role</th>
                    <th>Description</th>
                    <th>Permissions</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles?.map((role) => (
                    <tr key={role.id}>
                      <td className="ps-4 fw-semibold">
                        <div className="d-flex align-items-center gap-2">
                          {role.name}
                          {role.isSystem && (
                            <Badge bg="secondary" className="bg-secondary-subtle text-secondary-emphasis d-inline-flex align-items-center gap-1">
                              <ShieldCheck size={12} />
                              System
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-secondary">{role.description || '—'}</td>
                      <td>{role.permissions.length}</td>
                      <td className="pe-4">
                        <div className="d-flex gap-2">
                          <Button variant="outline-secondary" size="sm" onClick={() => openEdit(role)} title="Edit">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="outline-danger" size="sm" title="Delete" onClick={() => handleDelete(role)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">{editingRole ? `Edit ${editingRole.name}` : 'Create role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RoleForm
            initialValues={editingRole ? toFormValues(editingRole) : emptyFormValues}
            submitLabel={editingRole ? 'Save changes' : 'Create role'}
            submittingLabel="Saving…"
            onSubmit={handleSubmit}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

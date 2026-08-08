import { useState } from 'react';
import { Alert, Badge, Button, Card, Modal, OverlayTrigger, Spinner, Table, Tooltip } from 'react-bootstrap';
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

// Informational only — system roles are just seeded defaults, not delete-protected
function RoleTypeBadge({ role }: { role: Role }) {
  const tooltip = (
    <Tooltip>
      {role.isSystem
        ? 'Built-in role seeded by default. Can still be edited or deleted by a super admin.'
        : 'Custom role created by your team.'}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <Badge
        bg={role.isSystem ? 'secondary' : 'light'}
        text={role.isSystem ? undefined : 'dark'}
        className={
          role.isSystem
            ? 'bg-secondary-subtle text-secondary-emphasis d-inline-flex align-items-center gap-1'
            : 'border d-inline-flex align-items-center gap-1'
        }
      >
        {role.isSystem && <ShieldCheck size={12} />}
        {role.isSystem ? 'System' : 'Custom'}
      </Badge>
    </OverlayTrigger>
  );
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
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
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

  async function confirmDelete() {
    if (!roleToDelete) return;
    setError('');
    setSuccess('');
    try {
      await deleteRole(roleToDelete.id).unwrap();
      setSuccess(`${roleToDelete.name} deleted.`);
    } catch (actionError) {
      const message =
        actionError && typeof actionError === 'object' && 'data' in actionError
          ? (actionError as { data?: { message?: string } }).data?.message
          : undefined;
      // e.g. backend's "Cannot delete a role that is still assigned to staff accounts"
      setError(message ?? 'Unable to delete this role right now.');
    } finally {
      setRoleToDelete(null);
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
          ) : !roles || roles.length === 0 ? (
            <div className="p-4 text-secondary">No roles yet. Create one to get started.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Role</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Permissions</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className="ps-4 fw-semibold">{role.name}</td>
                      <td>
                        <RoleTypeBadge role={role} />
                      </td>
                      <td className="text-secondary">{role.description || '—'}</td>
                      <td>
                        {role.permissions.length === 0 ? (
                          <span className="text-secondary">No permissions</span>
                        ) : (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => setPermissionsRole(role)}
                          >
                            {role.permissions.length} permission{role.permissions.length === 1 ? '' : 's'}
                          </Button>
                        )}
                      </td>
                      <td className="pe-4">
                        <div className="d-flex gap-2">
                          <OverlayTrigger placement="top" overlay={<Tooltip>Edit role</Tooltip>}>
                            <Button variant="outline-secondary" size="sm" onClick={() => openEdit(role)}>
                              <Pencil size={14} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip>Delete role</Tooltip>}>
                            <Button variant="outline-danger" size="sm" onClick={() => setRoleToDelete(role)}>
                              <Trash2 size={14} />
                            </Button>
                          </OverlayTrigger>
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

      {/* Create / edit role */}
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

      {/* Delete confirmation */}
      <Modal show={!!roleToDelete} onHide={() => setRoleToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Delete role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{roleToDelete?.name}</strong>?
          {roleToDelete?.isSystem && (
            <>
              {' '}
              This is a built-in system role — deleting it can affect default permission setup.
            </>
          )}{' '}
          Staff members assigned to this role will lose the permissions it grants. This can’t be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setRoleToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete role
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View permissions */}
      <Modal show={!!permissionsRole} onHide={() => setPermissionsRole(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">{permissionsRole?.name} permissions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-2">
            {permissionsRole?.permissions.map((permission) => (
              <Badge
                key={permissionKey(permission.action, permission.subject)}
                bg="light"
                text="dark"
                className="border fw-normal"
              >
                {permission.action} {permission.subject}
              </Badge>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
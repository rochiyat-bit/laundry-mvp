import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { orderService } from '../services/order.service';
import { serviceService } from '../services/service.service';
import { useAuthStore } from '../stores/authStore';
import { Order, Service } from '../types';
import { Plus, Eye, Edit2, X, QrCode } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<
    { serviceId: string; quantity: number }[]
  >([{ serviceId: '', quantity: 1 }]);

  useEffect(() => {
    loadOrders();
    loadServices();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await serviceService.getAllServices(true);
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validItems = orderItems.filter((item) => item.serviceId && item.quantity > 0);
      if (validItems.length === 0) {
        alert('Please add at least one service');
        return;
      }

      await orderService.createOrder({
        items: validItems,
      });

      setShowCreateModal(false);
      setOrderItems([{ serviceId: '', quantity: 1 }]);
      loadOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleViewQR = (order: Order) => {
    setSelectedOrder(order);
    setShowQRModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const updatedOrder = await orderService.getOrderById(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { serviceId: '', quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (
    index: number,
    field: 'serviceId' | 'quantity',
    value: string | number
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Order
          </button>
        </div>

        <div className="card">
          {loading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-700">Order #</th>
                    <th className="text-left py-3 px-4 text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                      <td className="py-3 px-4">{order.customer.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleViewQR(order)}
                            className="text-green-600 hover:text-green-800"
                            title="View QR Code"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Order Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Order</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Items
                  </label>
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <select
                        value={item.serviceId}
                        onChange={(e) =>
                          updateOrderItem(index, 'serviceId', e.target.value)
                        }
                        className="input-field flex-1"
                        required
                      >
                        <option value="">Select Service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - Rp {service.price.toLocaleString('id-ID')}/{service.unit}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(index, 'quantity', parseFloat(e.target.value))
                        }
                        className="input-field w-24"
                        placeholder="Qty"
                        required
                      />
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrderItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary flex-1">
                    Create Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button onClick={() => setShowDetailModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedOrder.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-green-600">
                      Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-sm">Service</th>
                          <th className="text-left py-2 px-3 text-sm">Quantity</th>
                          <th className="text-left py-2 px-3 text-sm">Price</th>
                          <th className="text-left py-2 px-3 text-sm">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="py-2 px-3">{item.service.name}</td>
                            <td className="py-2 px-3">
                              {item.quantity} {item.service.unit}
                            </td>
                            <td className="py-2 px-3">
                              Rp {item.price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2 px-3">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {isStaff && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Update Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        handleUpdateStatus(selectedOrder.id, e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="WASHING">Washing</option>
                      <option value="DRYING">Drying</option>
                      <option value="IRONING">Ironing</option>
                      <option value="READY">Ready</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                )}

                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status History</p>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory.map((history) => (
                        <div key={history.id} className="flex justify-between text-sm">
                          <span className="font-medium">{history.status}</span>
                          <span className="text-gray-600">
                            {new Date(history.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order QR Code</h2>
                <button onClick={() => setShowQRModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Order Number: <span className="font-semibold">{selectedOrder.orderNumber}</span>
                </p>

                {selectedOrder.qrCode && (
                  <div className="flex justify-center">
                    <img
                      src={selectedOrder.qrCode}
                      alt="Order QR Code"
                      className="w-64 h-64 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  Scan this QR code to track your order
                </p>

                {selectedOrder.trackingUrl && (
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-1">Tracking URL:</p>
                    <input
                      type="text"
                      value={selectedOrder.trackingUrl}
                      readOnly
                      className="input-field text-sm"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    if (selectedOrder.qrCode) {
                      const link = document.createElement('a');
                      link.href = selectedOrder.qrCode;
                      link.download = `qr-${selectedOrder.orderNumber}.png`;
                      link.click();
                    }
                  }}
                  className="btn-primary w-full"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

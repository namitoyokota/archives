using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SqlClient;

namespace GroceryBama
{
    public partial class OrderHistory : Form
    {
        struct orders_past
        {
            public int orderId;
            public string store_name;
            public string date;
            public string total_price;
            public int num_items;
            public string isDelivered;
        }
        List<orders_past> my_orders = new List<orders_past>();
        bool is_descending = true;
        bool date_descending = true;
        public OrderHistory()
        {
            InitializeComponent();
            LoadAll();
            DisplayOrders();
        }

        private void button_next_Click(object sender, EventArgs e)
        {
            DisplayOrders();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            DisplayOrders();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_order_name_Click(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            if (!is_descending)
            {
                List<orders_past> temp = new List<orders_past>();
                temp = my_orders.OrderBy(o => o.store_name).ToList();
                my_orders = temp;
                DisplayOrders();
            }
            else
            {
                List<orders_past> temp = new List<orders_past>();
                temp = my_orders.OrderByDescending(o => o.store_name).ToList();
                my_orders = temp;
                DisplayOrders();
            }
        }

        private void button_order_date_Click(object sender, EventArgs e)
        {
            date_descending = !date_descending;
            if (!date_descending)
            {
                List<orders_past> temp = new List<orders_past>();
                temp = my_orders.OrderBy(o => o.date).ToList();
                my_orders = temp;
                DisplayOrders();
            }
            else
            {
                List<orders_past> temp = new List<orders_past>();
                temp = my_orders.OrderByDescending(o => o.date).ToList();
                my_orders = temp;
                DisplayOrders();
            }
        }

        private void button_order_details_Click(object sender, EventArgs e)
        {
            if (String.IsNullOrWhiteSpace(comboSelect.Text))
            {
                MessageBox.Show("Please select an order.");
                return;
            }
            Globals.current_order = comboSelect.Text.Split('-')[0].Trim();
            ListMyItems form = new ListMyItems();
            form.ShowDialog();
        }
        public void LoadAll()
        {
            my_orders.Clear();
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"SELECT DISTINCT store_name, u1.order_id, order_placed_date, is_delivered, sum_items, total_price FROM(

                                        (SELECT DISTINCT store_name, t1.order_id, order_placed_date, is_delivered, sum_items FROM(

                                        (SELECT o.order_id, order_placed_date, store_name, listed_price, s.quantity, is_delivered FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id
                                        WHERE buyer_username = @username) t1

                                        INNER JOIN

                                        (SELECT o2.order_id, SUM(s2.quantity) sum_items FROM[ORDERR] o2
                                        INNER JOIN ORDERED_BY c2 ON c2.order_id = o2.order_id
                                        INNER JOIN SELECTITEM s2 ON s2.order_id = o2.order_id
                                        INNER JOIN ORDERFROM os2 ON os2.order_id = o2.order_id
                                        INNER JOIN GROCERYSTORE g2 ON g2.store_id = os2.store_address_id
                                        INNER JOIN item i2 ON s2.item_id = i2.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o2.order_id
                                        WHERE buyer_username = @username
                                        GROUP BY o2.order_id) t2 on t1.order_id = t2.order_id)) u1

                                        INNER JOIN

                                        (SELECT o.order_id, SUM(listed_price * s.quantity) as total_price FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id
                                        WHERE buyer_username = @username
                                        GROUP BY o.order_id) u2 on u1.order_id = u2.order_id) ORDER BY order_id";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        orders_past o = new orders_past();
                        o.date = dr["order_placed_date"].ToString();
                        o.isDelivered = dr["is_delivered"].ToString().Trim();
                        o.num_items = Int32.Parse(dr["sum_items"].ToString());
                        o.store_name = dr["store_name"].ToString();
                        o.total_price = dr["total_price"].ToString();
                        o.orderId = Int32.Parse(dr["order_id"].ToString());
                        my_orders.Add(o);
                    }
                }
            }
        }
        public void DisplayOrders()
        {
            comboSelect.Items.Clear();
            if(my_orders.Count == 0)
            {
                textAll.Text = "You have no orders.";
                return;
            }
            textAll.Text = "";
            for (int i = 0; i < my_orders.Count; i++)
            {
                textAll.AppendText(String.Format("Store Name: {0} | Order ID: {1} | Date: {2} | Total Price: {3} | Total Number of Items: {4} | Delivered: {5}",
                    my_orders[i].store_name, my_orders[i].orderId, my_orders[i].date, my_orders[i].total_price, my_orders[i].num_items, my_orders[i].isDelivered));
                textAll.AppendText(Environment.NewLine);
                textAll.AppendText(Environment.NewLine);
                string comboAdd = "";
                comboAdd += my_orders[i].orderId;
                comboAdd += " - ";
                comboAdd += my_orders[i].store_name;
                comboSelect.Items.Add(comboAdd);
            }
        }
    }
}

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
    public partial class DelivererAssignments : Form
    {
        struct assignments
        {
            public int orderId;
            public string store_name;
            public string date;
            public string order_time;
            public string delivery_time;
            public string total_price;
            public int num_items;
        }
        List<assignments> my_assignments = new List<assignments>();
        bool is_descending = true;
        bool date_descending = true;
        bool time_descending = true;
        public DelivererAssignments()
        {
            InitializeComponent();
            LoadAll();
            DisplayAssignments();
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
                List<assignments> temp = new List<assignments>();
                temp = my_assignments.OrderBy(o => o.store_name).ToList();
                my_assignments = temp;
                DisplayAssignments();
            }
            else
            {
                List<assignments> temp = new List<assignments>();
                temp = my_assignments.OrderByDescending(o => o.store_name).ToList();
                my_assignments = temp;
                DisplayAssignments();
            }
        }
        private void button_order_details_Click(object sender, EventArgs e)
        {
            Globals.current_order = comboSelect.Text.Split('-')[0].Trim();
            AssignmentDetails form = new AssignmentDetails();
            form.ShowDialog();
        }
        private void button_time_Click(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            if (!is_descending)
            {
                List<assignments> temp = new List<assignments>();
                temp = my_assignments.OrderBy(o => o.order_time).ToList();
                my_assignments = temp;
                DisplayAssignments();
            }
            else
            {
                List<assignments> temp = new List<assignments>();
                temp = my_assignments.OrderByDescending(o => o.order_time).ToList();
                my_assignments = temp;
                DisplayAssignments();
            }
        }
        private void button_order_date_Click(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            if (!is_descending)
            {
                List<assignments> temp = new List<assignments>();
                temp = my_assignments.OrderBy(o => o.date).ToList();
                my_assignments = temp;
                DisplayAssignments();
            }
            else
            {
                List<assignments> temp = new List<assignments>();
                temp = my_assignments.OrderByDescending(o => o.date).ToList();
                my_assignments = temp;
                DisplayAssignments();
            }
        }
        public void LoadAll()
        {
            my_assignments.Clear();
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"SELECT distinct store_name, u1.order_id, order_placed_date, u1.order_placed_time, u1.delivery_time, sum_items, total_price FROM(

                                        (SELECT store_name, t1.order_id, order_placed_date, order_placed_time, t1.delivery_time, is_delivered, sum_items FROM(

                                        (SELECT o.order_id, order_placed_date, order_placed_time, store_name, listed_price, s.quantity, o.delivery_time, is_delivered FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id
                                        WHERE deliverer_username = @username and is_delivered = 0) t1

                                        INNER JOIN

                                        (SELECT o2.order_id, SUM(s2.quantity) sum_items FROM[ORDERR] o2
                                        INNER JOIN ORDERED_BY c2 ON c2.order_id = o2.order_id
                                        INNER JOIN SELECTITEM s2 ON s2.order_id = o2.order_id
                                        INNER JOIN ORDERFROM os2 ON os2.order_id = o2.order_id
                                        INNER JOIN GROCERYSTORE g2 ON g2.store_id = os2.store_address_id
                                        INNER JOIN item i2 ON s2.item_id = i2.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o2.order_id
                                        WHERE deliverer_username = @username and is_delivered = 0
                                        GROUP BY o2.order_id) t2 on t1.order_id = t2.order_id)) u1

                                        INNER JOIN

                                        (SELECT o.order_id, SUM(listed_price * s.quantity) as total_price FROM[ORDERR] o
                                        INNER JOIN ORDERED_BY c ON c.order_id = o.order_id
                                        INNER JOIN SELECTITEM s ON s.order_id = o.order_id
                                        INNER JOIN ORDERFROM os ON os.order_id = o.order_id
                                        INNER JOIN GROCERYSTORE g ON g.store_id = os.store_address_id
                                        INNER JOIN item i ON s.item_id = i.item_id
                                        INNER JOIN deliveredBy d ON d.order_id = o.order_id
                                        WHERE deliverer_username = @username and is_delivered = 0
                                        GROUP BY o.order_id) u2 on u1.order_id = u2.order_id) ORDER BY order_id";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        assignments o = new assignments();
                        o.date = dr["order_placed_date"].ToString();
                        o.delivery_time = dr["delivery_time"].ToString();
                        o.order_time = dr["order_placed_time"].ToString();
                        o.num_items = Int32.Parse(dr["sum_items"].ToString());
                        o.store_name = dr["store_name"].ToString();
                        o.total_price = dr["total_price"].ToString();
                        o.orderId = Int32.Parse(dr["order_id"].ToString());
                        my_assignments.Add(o);
                    }
                }
            }
        }
        public void DisplayAssignments()
        {
            comboSelect.Items.Clear();
            if (my_assignments.Count == 0)
            {
                textAll.Text = "You have no orders.";
                return;
            }
            textAll.Text = "";
            for (int i = 0; i < my_assignments.Count; i++)
            {
                textAll.AppendText(String.Format("Store Name: {0} | Order ID: {1} | Date: {2} | Total Price: {3} | Total Number of Items: {4} | Time Order Made: {5} | Time of Delivery {6}",
                    my_assignments[i].store_name, my_assignments[i].orderId, my_assignments[i].date, my_assignments[i].total_price, my_assignments[i].num_items, 
                    my_assignments[i].order_time, my_assignments[i].delivery_time));
                textAll.AppendText(Environment.NewLine);
                textAll.AppendText(Environment.NewLine);
                string comboAdd = "";
                comboAdd += my_assignments[i].orderId;
                comboAdd += " - ";
                comboAdd += my_assignments[i].store_name;
                comboSelect.Items.Add(comboAdd);
            }
        }
    }
}

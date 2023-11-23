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
    public partial class ListMyItems : Form
    {
        struct item_show
        {
            public string item_name;
            public string listed_price;
            public string quantity;
        }
        List<item_show> my_items = new List<item_show>();
        bool is_descending = true;
        public ListMyItems()
        {
            InitializeComponent();
            LoadAll();
            DisplayOrders();
        }
        public void LoadAll()
        {
            my_items.Clear();
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"select item_name, s.quantity, listed_price from item i inner join selectitem s on i.item_id = s.item_id where order_id = @order_id";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@order_id", SqlDbType.VarChar).Value = Globals.current_order;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        item_show o = new item_show();
                        o.quantity = dr["quantity"].ToString();
                        o.item_name = dr["item_name"].ToString();
                        o.listed_price = dr["listed_price"].ToString();
                        my_items.Add(o);
                    }
                }
            }
        }
        public void DisplayOrders()
        {
            textAll.Text = "";
            for (int i = 0; i < my_items.Count; i++)
            {
                textAll.AppendText(String.Format("Item Name: {0} | Quantity: {1} | Listed Price: {2}",
                    my_items[i].item_name, my_items[i].quantity, my_items[i].listed_price));
                textAll.AppendText(Environment.NewLine);
                textAll.AppendText(Environment.NewLine);
            }
        }

        private void button_order_name_Click_1(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            if (!is_descending)
            {
                List<item_show> temp = new List<item_show>();
                temp = my_items.OrderBy(o => o.item_name).ToList();
                my_items = temp;
                DisplayOrders();
            }
            else
            {
                List<item_show> temp = new List<item_show>();
                temp = my_items.OrderByDescending(o => o.item_name).ToList();
                my_items = temp;
                DisplayOrders();
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {

        }

        private void button_next_Click(object sender, EventArgs e)
        {

        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }
    }
}
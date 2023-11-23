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
    public partial class ViewInventory : Form
    {
        List<ITEM> items = new List<ITEM>();
        bool is_descending = true;
        public ViewInventory()
        {
            InitializeComponent();
            LoadAll();
            DisplayAll();
        }
        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }
        public void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"select * from item i inner join soldat s on i.item_id = s.item_id where store_id = @store_id order by item_name";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@store_id", SqlDbType.Int).Value = Globals.Persistent_Store.store_id;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        ITEM addItem = new ITEM();
                        addItem.item_id = Int32.Parse(dr["item_id"].ToString());
                        addItem.item_name = dr["item_name"].ToString();
                        addItem.quantity = Int32.Parse(dr["quantity"].ToString());
                        addItem.wholesale_price = Double.Parse(dr["wholesale_price"].ToString());
                        addItem.listed_price = Double.Parse(dr["listed_price"].ToString());
                        addItem.food_group = dr["food_group"].ToString();
                        addItem.description = dr["description"].ToString();
                        addItem.exp_date = dr["exp_date"].ToString();
                        items.Add(addItem);
                    }
                }
            }
        }
        public void DisplayAll()
        {
            textAll.Text = "";
            for (int i = 0; i < items.Count; i++)
            {
                textAll.AppendText(String.Format("Item Name: {0} | Description: {1} | Expiration Date: {2} | Retail Price: {3} | Wholesale Price: {4} | Quantity Remaining: {5}",
                    items[i].item_name, items[i].description, items[i].exp_date, items[i].listed_price, items[i].wholesale_price, items[i].quantity));
                textAll.AppendText(Environment.NewLine);
                textAll.AppendText(Environment.NewLine);
                string comboAdd = "";
                comboAdd += items[i].item_id;
                comboAdd += " - ";
                comboAdd += items[i].item_name;
                comboBox1.Items.Add(comboAdd);
            }
        }
        private void button_order_name_Click(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            if (!is_descending)
            {
                List<ITEM> temp = new List<ITEM>();
                temp = items.OrderBy(o => o.item_name).ToList();
                items = temp;
                DisplayAll();
            }
            else
            {
                List<ITEM> temp = new List<ITEM>();
                temp = items.OrderByDescending(o => o.item_name).ToList();
                items = temp;
                DisplayAll();
            }
        }

        private void button_delete_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "DELETE from [GROCERYBAMA1].[dbo].[item] where item_id = @item_id;";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@item_id", SqlDbType.Int).Value = Int32.Parse(comboBox1.Text.Split('-')[0].Trim());
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            MessageBox.Show("Delete Successful.");
            this.Close();
        }

        private void button_add_Click(object sender, EventArgs e)
        {
            addItem form = new addItem();
            form.Show();
        }
    }
}

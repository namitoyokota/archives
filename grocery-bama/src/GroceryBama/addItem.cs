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
    public partial class addItem : Form
    {
        List<ITEM> items = new List<ITEM>();
        int item_identification = 0;
        public addItem()
        {
            InitializeComponent();
            LoadAll();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Close();
        }
        public void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = @"select * from item";

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
        private void button_add_Click(object sender, EventArgs e)
        {
            foreach (var item in items)
            {
                if (item.item_id > item_identification) item_identification = item.item_id;
            }
            item_identification++;
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "INSERT INTO [GROCERYBAMA1].[dbo].[item] VALUES (@item_id, @item_name, @food_group, @exp_date, @quantity, @listed_price, @wholesale_price, @description);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@item_id", SqlDbType.Int).Value = item_identification;
                    command.Parameters.Add("@item_name", SqlDbType.VarChar).Value = textItem.Text;
                    command.Parameters.Add("@food_group", SqlDbType.VarChar).Value = textFoodGroup.Text;
                    command.Parameters.Add("@exp_date", SqlDbType.VarChar).Value = textExpirationDate.Text;
                    command.Parameters.Add("@quantity", SqlDbType.VarChar).Value = textQuantity.Text;
                    command.Parameters.Add("@listed_price", SqlDbType.VarChar).Value = textListedPrice.Text;
                    command.Parameters.Add("@wholesale_price", SqlDbType.VarChar).Value = textWholesalePrice.Text;
                    command.Parameters.Add("@description", SqlDbType.VarChar).Value = textDescription.Text;

                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                query = "INSERT INTO soldat VALUES (@item_id, @store_id)";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@item_id", SqlDbType.Int).Value = item_identification;
                    command.Parameters.Add("@store_id", SqlDbType.VarChar).Value = Globals.Persistent_Store.store_id;

                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            MessageBox.Show("Successfully added item.");
            this.Close();
        }
    }
}

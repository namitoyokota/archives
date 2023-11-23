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
    public partial class ListItems : Form
    {
        List<ITEM> items = new List<ITEM>();
        List<SOLDAT> items_sold_at = new List<SOLDAT>();
        List<GROCERYSTORE> stores = new List<GROCERYSTORE>();
        List<ITEM> validItems = new List<ITEM>();
        int counter = 0;
        int fiveReached = 0;
        int numValidItems = 0;
        bool is_descending = true;
        bool price_descending = true;
        public ListItems()
        {
            InitializeComponent();
            LoadAll();
            DisplayItems();
        }

        private void button_previous_Click(object sender, EventArgs e)
        {
            if (counter <= 5)
            {
                counter = 0;
            }
            else if (counter % 5 == 0)
            {
                counter -= 10;
            }
            else
            {
                counter -= counter % 5;
                counter -= 5;
            }
            validItems.Clear();
            DisplayItems();
        }

        private void button_next_Click(object sender, EventArgs e)
        {
            //MessageBox.Show(counter.ToString());
            if (counter == numValidItems) return;
            if (counter < 5)
            {
                counter = 0;
            }
            validItems.Clear();
            DisplayItems();
        }

        private void button_add_item_Click(object sender, EventArgs e)
        {
            if(numericUpDown.Value < 1)
            {
                MessageBox.Show("Enter the quantity of items you want.");
                return;
            }
            ITEM addNew = new ITEM();
            bool itemFound = false;
            foreach (var item in validItems)
            {
                if(item.item_id.ToString() == comboSelect.Text.Split('-')[0].Trim())
                {
                    itemFound = true;
                    addNew = item;
                    break;
                }
            }
            if (!itemFound)
            {
                MessageBox.Show("Please select an item.");
                return;
            }
            if(numericUpDown.Value > addNew.quantity)
            {
                MessageBox.Show("The quantity of items you are trying to buy exceeds the amount in stock.");
                return;
            }
            addNew.quantity = Decimal.ToInt32(numericUpDown.Value);
            itemFound = false;
            foreach(var items in Globals.cart)
            {
                if(addNew.item_id == items.item_id)
                {
                    items.quantity += addNew.quantity;
                    itemFound = true;
                }
            }
            if(!itemFound) Globals.cart.Add(addNew);
            MessageBox.Show("Item added successfully to your cart!");
            this.Close();
        }

        private void button_order_name_Click(object sender, EventArgs e)
        {
            is_descending = !is_descending;
            validItems.Clear();
            items.Clear();
            if (!is_descending)
            {
                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[item] ORDER BY item_name";
                using (SqlConnection _con = new SqlConnection(connectionString))
                {
                    using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                    {
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
            else
            {
                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[item] ORDER BY item_name DESC";
                using (SqlConnection _con = new SqlConnection(connectionString))
                {
                    using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                    {
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
            if (counter % 5 == 0) counter -= 5;
            else
            {
                counter -= counter % 5;
            }
            DisplayItems();
        }
        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[grocerystore]";
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        GROCERYSTORE addStore = new GROCERYSTORE();
                        addStore.store_id = Int32.Parse(dr["store_id"].ToString());
                        addStore.store_name = dr["store_name"].ToString();
                        addStore.phone = dr["phone"].ToString();
                        addStore.address_id = Int32.Parse(dr["address_id"].ToString());
                        addStore.opening_time = dr["opening_time"].ToString();
                        addStore.closing_time = dr["closing_time"].ToString();
                        stores.Add(addStore);
                    }
                }
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[item] ORDER BY item_name";
                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
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
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[soldat]";
                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        SOLDAT addItem = new SOLDAT();
                        addItem.store_id = Int32.Parse(dr["store_id"].ToString());
                        addItem.item_id = Int32.Parse(dr["item_id"].ToString());
                        items_sold_at.Add(addItem);
                    }
                }
            }
        }
        private void DisplayItems()
        {
            textAll.Text = "";
            fiveReached = 0;
            comboSelect.Items.Clear();
            foreach (var item in items)
            {
                foreach(var sold_at in items_sold_at)
                {
                    if(sold_at.store_id == Globals.Chosen_Store.store_id && sold_at.item_id == item.item_id)
                    {
                        if (item.food_group == Globals.Chosen_Item_Lookup) validItems.Add(item);
                    }
                }
            }
            numValidItems = validItems.Count();
            if (!(validItems.Any()))
            {
                textAll.AppendText("There are none of these items in stock at this store.");
                return;
            }
            for (int i = counter; i < validItems.Count; i++)
            {
                if (fiveReached == 5) break;
                textAll.AppendText(String.Format("Item Name: {0} | Description: {1} | Expiration Date: {2} | Price: {3} | Quantity Remaining: {4}",
                    validItems[i].item_name, validItems[i].description, validItems[i].exp_date, validItems[i].listed_price, validItems[i].quantity));
                textAll.AppendText(Environment.NewLine);
                textAll.AppendText(Environment.NewLine);
                string comboAdd = "";
                comboAdd += validItems[i].item_id;
                comboAdd += " - ";
                comboAdd += validItems[i].item_name;
                comboSelect.Items.Add(comboAdd);
                fiveReached++;
                counter++;
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            price_descending = !price_descending;
            validItems.Clear();
            items.Clear();
            if (!price_descending)
            {
                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[item] ORDER BY listed_price";
                using (SqlConnection _con = new SqlConnection(connectionString))
                {
                    using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                    {
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
            else
            {
                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[item] ORDER BY listed_price DESC";
                using (SqlConnection _con = new SqlConnection(connectionString))
                {
                    using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                    {
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
            if (counter % 5 == 0) counter -= 5;
            else
            {
                counter -= counter % 5;
            }
            DisplayItems();
        }
    }
}

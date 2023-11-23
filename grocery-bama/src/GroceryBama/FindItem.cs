using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GroceryBama
{
    public partial class FindItem : Form
    {
        public FindItem()
        {
            InitializeComponent();
        }

        private void button9_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Baking Goods";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_beverages_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Beverages";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_cleaning_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Cleaning";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_canned_goods_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Canned Goods";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_dairy_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Dairy";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_frozen_foods_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Frozen Foods";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_produce_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Produce";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_personal_care_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Personal Care";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_meat_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Meat";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_other_Click(object sender, EventArgs e)
        {
            Globals.Chosen_Item_Lookup = "Other";
            ListItems form = new ListItems();
            form.ShowDialog();
        }

        private void button_checkout_Click(object sender, EventArgs e)
        {
            if (!Globals.cart.Any())
            {
                MessageBox.Show("There is nothing in your cart.");
                return;
            }
            ViewCart form = new ViewCart();
            form.ShowDialog();
        }
    }
}

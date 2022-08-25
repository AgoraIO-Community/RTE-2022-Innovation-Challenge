package io.agora.metachat.example.adapter;

import android.content.Context;
import android.graphics.Color;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckedTextView;
import android.widget.ListView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import io.agora.metachat.example.R;

public class SexAdapter extends ArrayAdapter<CharSequence> {

    int margin;
    int checkedIndex;

    public SexAdapter(@NonNull Context context) {
        super(
                context,
                R.layout.item_spinner,
                android.R.id.text1,
                context.getResources().getStringArray(R.array.sex_array)
        );
        margin = (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                11,
                context.getResources().getDisplayMetrics()
        );
    }

    @Override
    public View getDropDownView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
        if (parent instanceof ListView) {
            ((ListView) parent).setSelector(android.R.color.transparent);
        }
        View view = super.getDropDownView(position, convertView, parent);
        view.setBackgroundColor(Color.TRANSPARENT);

        CheckedTextView textView = view.findViewById(android.R.id.text1);
        textView.setChecked(checkedIndex == position);

        ViewGroup.MarginLayoutParams layoutParams = (ViewGroup.MarginLayoutParams)
                textView.getLayoutParams();
        if (position == 0) {
            layoutParams.setMargins(0, margin, 0, 0);
        } else if (position == getCount() - 1) {
            layoutParams.setMargins(0, 0, 0, margin);
        } else {
            layoutParams.setMargins(0, 0, 0, 0);
        }
        return view;
    }

    public void check(int position) {
        checkedIndex = position;
        notifyDataSetChanged();
    }

}
